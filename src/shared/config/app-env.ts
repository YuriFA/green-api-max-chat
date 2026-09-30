interface AppEnv {
  greenApiBaseUrl: string;
  isMockEnabled: boolean;
}

const DEFAULT_GREEN_API_BASE_URL = "https://api.green-api.com";

const readQueryFlag = (): boolean => new URLSearchParams(window.location.search).has("mock");

export const appEnv: AppEnv = {
  greenApiBaseUrl: import.meta.env.VITE_GREEN_API_BASE_URL?.trim() || DEFAULT_GREEN_API_BASE_URL,
  isMockEnabled: import.meta.env.VITE_GREEN_API_MOCK === "1" || readQueryFlag(),
};
