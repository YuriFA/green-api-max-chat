import type { MessageDirection, MessageStatus, Message } from "./schemas";

export type { MessageDirection, MessageStatus, Message };

export interface RemoteMessageInput {
  idMessage: string;
  direction: MessageDirection;
  text: string;
  timestamp: number;
}
