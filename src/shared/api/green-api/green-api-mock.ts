import { delay } from "@/shared/lib/delay";
import type { GreenApiClient } from "./green-api-client";
import type {
  CheckAccountOutcome,
  CheckAccountRequest,
  DeleteNotificationResponse,
  GetContactInfoRequest,
  GetContactInfoResponse,
  ReceiveNotificationResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "./types";

interface QueuedNotification {
  receiptId: number;
  body: ReceiveNotificationResponse["body"];
}

const abortError = (): DOMException => new DOMException("The operation was aborted.", "AbortError");

const AUTO_REPLY_DELAY_MS = 2000;
const POLL_INTERVAL_MS = 100;
const CONTACT_INFO_DELAY_MS = 300;

const OUTGOING_STATUS_CHAIN = [
  { status: "sent", delayMs: 600 },
  { status: "delivered", delayMs: 1600 },
  { status: "read", delayMs: 3200 },
] as const;

const DEMO_CONTACT_NAMES = [
  "Алиса Загорская",
  "Марк Ветров",
  "Полина Ким",
  "Тимур Соколов",
  "Вера Ланская",
  "Егор Шумилов",
] as const;

export class MockGreenApiClient implements GreenApiClient {
  private receiptSeq = 1;
  private messageSeq = 1;
  private queue: QueuedNotification[] = [];

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const idMessage = `mock-out-${this.messageSeq++}`;
    this.queue.push({
      receiptId: this.receiptSeq++,
      body: {
        typeWebhook: "outgoingAPIMessageReceived",
        timestamp: Math.floor(Date.now() / 1000),
        idMessage,
        senderData: {
          chatId: request.chatId,
          chatName: request.chatId,
          sender: request.chatId,
        },
        messageData: {
          typeMessage: "textMessage",
          textMessageData: { textMessage: request.message },
        },
      },
    });
    this.scheduleAutoReply(request);
    this.scheduleOutgoingStatuses(request.chatId, idMessage);
    return { idMessage };
  }

  async checkAccount(request: CheckAccountRequest): Promise<CheckAccountOutcome> {
    await delay(300);
    if (request.phoneNumber.endsWith("0")) {
      return { kind: "not-found" };
    }
    return {
      kind: "exists",
      chatId: `mock-${request.phoneNumber.slice(-8)}`,
    };
  }

  async getContactInfo(request: GetContactInfoRequest): Promise<GetContactInfoResponse> {
    await delay(CONTACT_INFO_DELAY_MS);
    const digits = request.chatId.replace(/\D/g, "");
    const name = DEMO_CONTACT_NAMES[Number(digits.slice(-1)) % DEMO_CONTACT_NAMES.length];
    return {
      avatar: "",
      name,
      contactName: name,
      chatId: request.chatId,
      chatType: "user",
      lastSeen: Math.floor(Date.now() / 1000),
      phoneNumber: digits.slice(-11),
    };
  }

  async receiveNotification(
    receiveTimeoutSeconds: number,
    signal?: AbortSignal,
  ): Promise<ReceiveNotificationResponse | null> {
    const deadline = Date.now() + receiveTimeoutSeconds * 1000;
    while (Date.now() < deadline) {
      if (signal?.aborted) throw abortError();
      const notification = this.queue.shift();
      if (notification) return notification;
      await delay(POLL_INTERVAL_MS);
    }
    return null;
  }

  async deleteNotification(_receiptId: number): Promise<DeleteNotificationResponse> {
    return { result: true, reason: "" };
  }

  private scheduleOutgoingStatuses(chatId: string, idMessage: string): void {
    for (const { status, delayMs } of OUTGOING_STATUS_CHAIN) {
      setTimeout(() => {
        this.queue.push({
          receiptId: this.receiptSeq++,
          body: {
            typeWebhook: "outgoingMessageStatus",
            chatId,
            timestamp: Math.floor(Date.now() / 1000),
            idMessage,
            status,
          },
        });
      }, delayMs);
    }
  }

  private scheduleAutoReply(request: SendMessageRequest): void {
    setTimeout(() => {
      this.queue.push({
        receiptId: this.receiptSeq++,
        body: {
          typeWebhook: "incomingMessageReceived",
          timestamp: Math.floor(Date.now() / 1000),
          idMessage: `mock-in-${this.messageSeq++}`,
          senderData: {
            chatId: request.chatId,
            chatName: request.chatId,
            sender: request.chatId,
            senderName: "Демо-бот MAX",
          },
          messageData: {
            typeMessage: "textMessage",
            textMessageData: {
              textMessage: `Демо-ответ на сообщение: «${request.message}»`,
            },
          },
        },
      });
    }, AUTO_REPLY_DELAY_MS);
  }
}
