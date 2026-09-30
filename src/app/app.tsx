import { useState } from "react";

import { ChatView } from "@/views/chat/chat-view";
import { LoginView } from "@/views/login/login-view";
import { createGreenApiClient } from "@/shared/api/green-api/create-green-api-client";
import { GreenApiProvider } from "@/shared/api/green-api/green-api-context";
import type { GreenApiCredentials } from "@/shared/api/green-api/types";
import type { GreenApiClient } from "@/shared/api/green-api/green-api-client";
import { useChatStore } from "@/entities/chat/model/chat-store";
import {
  clearStoredCredentials,
  loadStoredCredentials,
  saveStoredCredentials,
} from "@/shared/lib/stored-credentials";

type AuthState =
  | { credentials: GreenApiCredentials; client: GreenApiClient }
  | { credentials: null; client: null };

const initAuthState = (): AuthState => {
  const credentials = loadStoredCredentials();
  if (!credentials) return { credentials: null, client: null };
  return { credentials, client: createGreenApiClient(credentials) };
};

export const App = () => {
  const [auth, setAuth] = useState<AuthState>(initAuthState);

  const handleLogin = (credentials: GreenApiCredentials) => {
    saveStoredCredentials(credentials);
    setAuth({ credentials, client: createGreenApiClient(credentials) });
  };

  const handleLogout = () => {
    clearStoredCredentials();
    useChatStore.getState().resetChats();
    setAuth({ credentials: null, client: null });
  };

  if (!auth.credentials) {
    return <LoginView onSubmit={handleLogin} />;
  }

  return (
    <GreenApiProvider client={auth.client}>
      <ChatView onLogout={handleLogout} />
    </GreenApiProvider>
  );
};
