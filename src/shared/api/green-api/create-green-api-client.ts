import { appEnv } from "@/shared/config/app-env";
import type { GreenApiClient } from "./green-api-client";
import { HttpGreenApiClient } from "./green-api-client";
import { MockGreenApiClient } from "./green-api-mock";
import type { GreenApiCredentials } from "./types";

export const createGreenApiClient = (credentials: GreenApiCredentials): GreenApiClient =>
  appEnv.isMockEnabled ? new MockGreenApiClient() : new HttpGreenApiClient(credentials);
