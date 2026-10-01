import type { NotificationBody } from "@/shared/api/green-api/types";

import type { MessageStatus } from "./message";

export type ParsedNotification =
  | {
      kind: "incoming";
      chatId: string;
      idMessage: string;
      text: string;
      timestamp: number;
      senderName: string | null;
      senderPhone: string | null;
    }
  | {
      kind: "outgoingApi";
      chatId: string;
      idMessage: string;
      text: string;
      timestamp: number;
    }
  | {
      kind: "status";
      chatId: string;
      idMessage: string;
      status: MessageStatus;
    };

const OUTGOING_STATUSES: Partial<Record<string, MessageStatus>> = {
  sent: "sent",
  delivered: "delivered",
  read: "read",
  failed: "failed",
  noAccount: "failed",
  notInGroup: "failed",
};

export const parseNotification = (body: NotificationBody): ParsedNotification | null => {
  if (body.typeWebhook === "outgoingMessageStatus") {
    const chatId = body.chatId;
    const status = body.status ? OUTGOING_STATUSES[body.status] : undefined;
    if (!chatId || !status) return null;
    return { kind: "status", chatId, idMessage: body.idMessage, status };
  }

  const chatId = body.senderData?.chatId;
  const text = body.messageData?.textMessageData?.textMessage;
  if (!chatId || !text) return null;

  if (
    body.typeWebhook === "incomingMessageReceived" &&
    body.messageData?.typeMessage === "textMessage"
  ) {
    return {
      kind: "incoming",
      chatId,
      idMessage: body.idMessage,
      text,
      timestamp: body.timestamp * 1000,
      senderName: body.senderData?.senderName ?? body.senderData?.chatName ?? null,
      senderPhone: body.senderData?.senderPhoneNumber ?? null,
    };
  }

  if (body.typeWebhook === "outgoingAPIMessageReceived") {
    return {
      kind: "outgoingApi",
      chatId,
      idMessage: body.idMessage,
      text,
      timestamp: body.timestamp * 1000,
    };
  }

  return null;
};
