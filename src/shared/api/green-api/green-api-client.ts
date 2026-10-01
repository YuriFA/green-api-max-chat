import { appEnv } from "@/shared/config/app-env";
import type {
  CheckAccountOutcome,
  CheckAccountRequest,
  DeleteNotificationResponse,
  GetContactInfoRequest,
  GetContactInfoResponse,
  GreenApiCredentials,
  ReceiveNotificationResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "./types";

export class GreenApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GreenApiError";
    this.status = status;
  }
}

type FetchFn = (url: string, init: RequestInit) => Promise<Response>;

export interface GreenApiClient {
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  checkAccount(request: CheckAccountRequest): Promise<CheckAccountOutcome>;
  getContactInfo(request: GetContactInfoRequest): Promise<GetContactInfoResponse>;
  receiveNotification(
    receiveTimeoutSeconds: number,
    signal?: AbortSignal,
  ): Promise<ReceiveNotificationResponse | null>;
  deleteNotification(receiptId: number): Promise<DeleteNotificationResponse>;
}

interface CheckAccountServiceResponse {
  exist?: boolean;
  chatId?: string;
  status?: boolean;
  reason?: string;
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

const extractErrorMessage = async (response: Response): Promise<string> => {
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const key of ["message", "error", "reason", "text"]) {
      if (typeof parsed[key] === "string" && parsed[key]) {
        return parsed[key] as string;
      }
    }
  } catch {
    if (raw) return raw.slice(0, 200);
  }
  return `HTTP ${response.status}`;
};

export class HttpGreenApiClient implements GreenApiClient {
  private readonly baseUrl: string;
  private readonly idInstance: string;
  private readonly apiTokenInstance: string;
  private readonly fetchFn: FetchFn;

  constructor(credentials: GreenApiCredentials, options?: { baseUrl?: string; fetchFn?: FetchFn }) {
    this.baseUrl = options?.baseUrl ?? appEnv.greenApiBaseUrl;
    this.idInstance = credentials.idInstance;
    this.apiTokenInstance = credentials.apiTokenInstance;
    this.fetchFn = options?.fetchFn ?? fetch.bind(globalThis);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>("sendMessage", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(request),
    });
  }

  async checkAccount(request: CheckAccountRequest): Promise<CheckAccountOutcome> {
    const response = await this.request<CheckAccountServiceResponse>("checkAccount", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(request),
    });
    if (typeof response.exist === "boolean") {
      return response.exist && response.chatId
        ? { kind: "exists", chatId: response.chatId }
        : { kind: "not-found" };
    }
    return {
      kind: "unavailable",
      reason: response.reason ?? "HTTP-ответ без статуса аккаунта",
    };
  }

  async getContactInfo(request: GetContactInfoRequest): Promise<GetContactInfoResponse> {
    return this.request<GetContactInfoResponse>("getContactInfo", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(request),
    });
  }

  async receiveNotification(
    receiveTimeoutSeconds: number,
    signal?: AbortSignal,
  ): Promise<ReceiveNotificationResponse | null> {
    const body = await this.requestText(
      "receiveNotification",
      `?receiveTimeout=${receiveTimeoutSeconds}`,
      { signal },
    );
    if (!body) return null;
    return JSON.parse(body) as ReceiveNotificationResponse;
  }

  async deleteNotification(receiptId: number): Promise<DeleteNotificationResponse> {
    return this.request<DeleteNotificationResponse>(
      "deleteNotification",
      { method: "DELETE" },
      `/${receiptId}`,
    );
  }

  private buildUrl(method: string, suffix = ""): string {
    return `${this.baseUrl}/waInstance${this.idInstance}/${method}/${this.apiTokenInstance}${suffix}`;
  }

  private async request<T>(method: string, init?: RequestInit, suffix = ""): Promise<T> {
    const response = await this.fetchOrThrow(method, init ?? {}, suffix);
    return (await response.json()) as T;
  }

  private async requestText(method: string, suffix = "", init: RequestInit = {}): Promise<string> {
    const response = await this.fetchOrThrow(method, init, suffix);
    return response.text();
  }

  private async fetchOrThrow(method: string, init: RequestInit, suffix: string): Promise<Response> {
    const response = await this.fetchFn(this.buildUrl(method, suffix), init);
    if (!response.ok) {
      throw new GreenApiError(await extractErrorMessage(response), response.status);
    }
    return response;
  }
}
