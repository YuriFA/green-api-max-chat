import { parsePhoneNumberFromString } from "libphonenumber-js/min";

/**
 * Phone parsing built on libphonenumber-js (min metadata build: the app needs
 * only parsing, validation and international formatting for RU/BY, which the
 * min build provides at half the size of the full metadata).
 *
 * Phone values are E.164 strings without the leading "+", e.g. "79991234567" -
 * the representation GREEN API expects.
 */

export type PhoneParseResult = { ok: true; value: string } | { ok: false; error: string };

const UNSUPPORTED_ERROR = "Поддерживаются номера России и Беларуси (+7, +375)";
const INVALID_ERROR = "Некорректный номер телефона";

const isSupportedCountry = (country: string): boolean => country === "RU" || country === "BY";

export const parsePhone = (input: string): PhoneParseResult => {
  // Try each supported country as the parsing context: RU handles "+7 ...",
  // the "8" trunk prefix and bare 10-digit national numbers; BY handles
  // "+375 ..." and bare Belarusian forms.
  for (const country of ["RU", "BY"] as const) {
    const parsed = parsePhoneNumberFromString(input, country);
    if (parsed?.isValid() && parsed.country && isSupportedCountry(parsed.country)) {
      return { ok: true, value: parsed.number.slice(1) };
    }
  }

  // Nothing valid in a supported context: classify the failure. A number that
  // resolves to another country (including +7-sharing Kazakhstan) is out of
  // scope; a number aimed at +7/+375 that fails validation is incorrect;
  // anything else is unusable input.
  const parsed = parsePhoneNumberFromString(input);
  if (parsed?.country && !isSupportedCountry(parsed.country)) {
    return { ok: false, error: UNSUPPORTED_ERROR };
  }
  const aimsAtSupportedCountry =
    parsed !== undefined &&
    (parsed.countryCallingCode === "7" || parsed.countryCallingCode === "375");
  return { ok: false, error: aimsAtSupportedCountry ? INVALID_ERROR : UNSUPPORTED_ERROR };
};

export const formatPhone = (phone: string): string => {
  const parsed = parsePhoneNumberFromString(phone.startsWith("+") ? phone : `+${phone}`);
  return parsed?.isValid() ? parsed.formatInternational() : `+${phone.replace(/\D/g, "")}`;
};
