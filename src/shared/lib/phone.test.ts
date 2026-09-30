import { describe, expect, it } from "vitest";

import { formatPhone, parsePhone } from "./phone";

describe("parsePhone", () => {
  it("parses a formatted russian number", () => {
    expect(parsePhone("+7 999 123-45-67")).toEqual({
      ok: true,
      value: "79991234567",
    });
  });

  it("converts an 8-prefix number to the 7 country code", () => {
    expect(parsePhone("89991234567")).toEqual({
      ok: true,
      value: "79991234567",
    });
  });

  it("prepends the country code to a 10-digit russian number", () => {
    expect(parsePhone("9991234567")).toEqual({
      ok: true,
      value: "79991234567",
    });
  });

  it("accepts a belarus number", () => {
    expect(parsePhone("+375 29 123-45-67")).toEqual({
      ok: true,
      value: "375291234567",
    });
  });

  it("rejects a number invalid for the region", () => {
    const result = parsePhone("+7 123 456 78 90");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Некорректный номер телефона");
    }
  });

  it("rejects a number with an unsupported country code", () => {
    const result = parsePhone("+1 415 555 2671");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("+7");
    }
  });

  it("rejects a too short input", () => {
    expect(parsePhone("123").ok).toBe(false);
  });

  it("rejects an empty input", () => {
    expect(parsePhone("").ok).toBe(false);
  });
});

describe("formatPhone", () => {
  it("formats a russian number", () => {
    expect(formatPhone("79991234567")).toBe("+7 999 123 45 67");
  });

  it("formats a belarus number", () => {
    expect(formatPhone("375291234567")).toBe("+375 29 123 45 67");
  });

  it("keeps unknown formats as-is with a plus prefix", () => {
    expect(formatPhone("123")).toBe("+123");
  });
});
