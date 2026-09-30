import type { NotificationBody } from "@/shared/api/green-api/types";

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
    };

export const parseNotification = (body: NotificationBody): ParsedNotification | null => {
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
