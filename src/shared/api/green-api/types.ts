export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

/** E.164 without the leading "+", e.g. "79991234567". */
export type PhoneNumber = string;

export interface CheckAccountRequest {
  phoneNumber: PhoneNumber;
}

export type CheckAccountOutcome =
  | { kind: "exists"; chatId: string }
  | { kind: "not-found" }
  | { kind: "unavailable"; reason: string };

export interface GetContactInfoRequest {
  chatId: string;
}

export interface GetContactInfoResponse {
  avatar?: string;
  name?: string;
  contactName?: string;
  chatId?: string;
  chatType?: string;
  lastSeen?: number | null;
  phoneNumber?: PhoneNumber;
  phoneNumberTimestamp?: number;
}

export interface NotificationSenderData {
  chatId: string;
  chatName?: string;
  chatType?: string;
  sender?: string;
  senderName?: string;
  senderPhoneNumber?: PhoneNumber;
}

export interface NotificationMessageData {
  typeMessage?: string;
  textMessageData?: {
    textMessage?: string;
  };
}

export interface NotificationBody {
  typeWebhook: string;
  timestamp: number;
  idMessage: string;
  senderData?: NotificationSenderData;
  messageData?: NotificationMessageData;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: NotificationBody;
}

export interface DeleteNotificationResponse {
  result: boolean;
  reason: string;
}
