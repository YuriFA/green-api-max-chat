import type { GreenApiCredentials } from "@/shared/api/green-api/types";

export const STORAGE_CREDENTIALS_KEY = "green-api-max-chat.credentials";

const isCredentials = (value: unknown): value is GreenApiCredentials => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.idInstance === "string" && typeof candidate.apiTokenInstance === "string";
};

export const loadStoredCredentials = (): GreenApiCredentials | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCredentials(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveStoredCredentials = (credentials: GreenApiCredentials): void => {
  try {
    window.localStorage.setItem(STORAGE_CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch {}
};

export const clearStoredCredentials = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_CREDENTIALS_KEY);
  } catch {}
};
