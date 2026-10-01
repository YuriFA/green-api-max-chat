import { expect, it } from "vitest";

import type { NotificationBody } from "@/shared/api/green-api/types";

import { parseNotification } from "./parse-notification";

it("parses an incoming text message", () => {
  const body: NotificationBody = {
    typeWebhook: "incomingMessageReceived",
    timestamp: 1763115112,
    idMessage: "msg1",
    senderData: {
      chatId: "10000000",
      senderName: "Вася",
      senderPhoneNumber: "79991234567",
    },
    messageData: {
      typeMessage: "textMessage",
      textMessageData: { textMessage: "привет" },
    },
  };

  expect(parseNotification(body)).toEqual({
    kind: "incoming",
    chatId: "10000000",
    idMessage: "msg1",
    text: "привет",
    timestamp: 1763115112000,
    senderName: "Вася",
    senderPhone: "79991234567",
  });
});

it("parses an outgoing status notification", () => {
  const body: NotificationBody = {
    typeWebhook: "outgoingMessageStatus",
    chatId: "10000000",
    timestamp: 1763115112,
    idMessage: "msg1",
    status: "delivered",
  };

  expect(parseNotification(body)).toEqual({
    kind: "status",
    chatId: "10000000",
    idMessage: "msg1",
    status: "delivered",
  });
});

it("returns null for non-text messages", () => {
  const body: NotificationBody = {
    typeWebhook: "incomingMessageReceived",
    timestamp: 1763115112,
    idMessage: "msg1",
    senderData: { chatId: "10000000" },
    messageData: { typeMessage: "imageMessage" },
  };

  expect(parseNotification(body)).toBeNull();
});

it("returns null for unsupported webhook types", () => {
  expect(
    parseNotification({ typeWebhook: "statusInstanceChanged", timestamp: 0, idMessage: "x" }),
  ).toBeNull();
});
