interface ImportMetaEnv {
  readonly VITE_GREEN_API_ID_INSTANCE?: string;
  readonly VITE_GREEN_API_API_TOKEN_INSTANCE?: string;
  readonly VITE_GREEN_API_BASE_URL?: string;
  readonly VITE_GREEN_API_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
