import { useEffect, useState } from "react";

import { GreenApiError } from "@/shared/api/green-api/green-api-client";
import { useGreenApiClient } from "@/shared/api/green-api/green-api-context";
import {
  MIN_POLL_INTERVAL_MS,
  RECEIVE_TIMEOUT_SECONDS,
  RETRY_DELAY_MS,
} from "@/shared/config/polling";
import { formatPhone } from "@/shared/lib/phone";
import {
  parseNotification,
  type ParsedNotification,
} from "@/entities/chat/model/parse-notification";
import { useChatStore } from "@/entities/chat/model/chat-store";

export type PollingStatus = "online" | "reconnecting" | "error";

export interface PollingState {
  status: PollingStatus;
  errorMessage: string | null;
}

const FATAL_ERROR_STATUSES = new Set([401, 403]);

const ensureChatExists = (
  chatId: string,
  senderName: string | null,
  senderPhone: string | null,
) => {
  const { chats, createChat } = useChatStore.getState();
  if (chats.some((chat) => chat.id === chatId)) return;
  const title = senderName ?? (senderPhone ? formatPhone(senderPhone) : chatId);
  createChat({ id: chatId, title });
};

const applyNotification = (parsed: ParsedNotification) => {
  const store = useChatStore.getState();

  if (parsed.kind === "incoming") {
    ensureChatExists(parsed.chatId, parsed.senderName, parsed.senderPhone);
    store.upsertRemoteMessage(parsed.chatId, {
      idMessage: parsed.idMessage,
      direction: "in",
      text: parsed.text,
      timestamp: parsed.timestamp,
    });
    return;
  }

  ensureChatExists(parsed.chatId, null, null);

  store.upsertRemoteMessage(parsed.chatId, {
    idMessage: parsed.idMessage,
    direction: "out",
    text: parsed.text,
    timestamp: parsed.timestamp,
  });
};

export const useNotificationPolling = (): PollingState => {
  const client = useGreenApiClient();
  const [polling, setPolling] = useState<PollingState>({
    status: "online",
    errorMessage: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextPoll = (delayMs: number) => {
      if (signal.aborted) return;
      timer = setTimeout(() => {
        timer = undefined;
        poll();
      }, delayMs);
    };

    const poll = async () => {
      const startedAt = Date.now();
      try {
        const notification = await client.receiveNotification(RECEIVE_TIMEOUT_SECONDS, signal);
        if (signal.aborted) return;
        setPolling({ status: "online", errorMessage: null });
        if (notification) {
          const parsed = parseNotification(notification.body);
          if (parsed) {
            applyNotification(parsed);
          }
          await client.deleteNotification(notification.receiptId);
        }
      } catch (error) {
        if (signal.aborted) return;
        if (error instanceof GreenApiError && FATAL_ERROR_STATUSES.has(error.status)) {
          setPolling({
            status: "error",
            errorMessage: `Доступ запрещён (${error.status}). Проверьте учётные данные GREEN-API`,
          });
          return;
        }
        setPolling({
          status: "reconnecting",
          errorMessage: error instanceof Error ? error.message : "Ошибка сети",
        });
        scheduleNextPoll(RETRY_DELAY_MS);
        return;
      }
      const elapsed = Date.now() - startedAt;
      scheduleNextPoll(Math.max(0, MIN_POLL_INTERVAL_MS - elapsed));
    };

    poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [client]);

  return polling;
};
