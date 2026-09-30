import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { GreenApiClient } from "./green-api-client";

const GreenApiContext = createContext<GreenApiClient | null>(null);

export const GreenApiProvider = ({
  client,
  children,
}: {
  client: GreenApiClient;
  children: ReactNode;
}) => <GreenApiContext.Provider value={client}>{children}</GreenApiContext.Provider>;

export const useGreenApiClient = (): GreenApiClient => {
  const client = useContext(GreenApiContext);
  if (!client) {
    throw new Error("useGreenApiClient must be used inside GreenApiProvider");
  }
  return client;
};
