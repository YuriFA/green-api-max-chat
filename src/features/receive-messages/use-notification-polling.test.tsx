import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";

import type { GreenApiClient } from "@/shared/api/green-api/green-api-client";
import { GreenApiError } from "@/shared/api/green-api/green-api-client";
import { GreenApiProvider } from "@/shared/api/green-api/green-api-context";
import { useChatStore } from "@/entities/chat/model/chat-store";
import type { ReceiveNotificationResponse } from "@/shared/api/green-api/types";

import { useNotificationPolling } from "./use-notification-polling";

vi.mock("@/shared/config/polling", async (importOriginal) => {
  const actual = await importOriginal<() => typeof import("@/shared/config/polling")>();
  return { ...actual, RETRY_DELAY_MS: 50, MIN_POLL_INTERVAL_MS: 50 };
});

const incomingNotification: ReceiveNotificationResponse = {
  receiptId: 11,
  body: {
    typeWebhook: "incomingMessageReceived",
    timestamp: 1763115112,
    idMessage: "m1",
    senderData: { chatId: "10000000", senderName: "Вася", senderPhoneNumber: "79991234567" },
    messageData: {
      typeMessage: "textMessage",
      textMessageData: { textMessage: "привет" },
    },
  },
};

const makeClient = (receive: GreenApiClient["receiveNotification"]): GreenApiClient => ({
  receiveNotification: receive,
  deleteNotification: vi.fn().mockResolvedValue({ result: true, reason: "" }),
  sendMessage: vi.fn().mockResolvedValue({ idMessage: "x" }),
  checkAccount: vi.fn().mockResolvedValue({ kind: "not-found" }),
});

const wrap =
  (client: GreenApiClient) =>
  ({ children }: { children: ReactNode }) => (
    <GreenApiProvider client={client}>{children}</GreenApiProvider>
  );

beforeEach(() => {
  useChatStore.setState({ chats: [], messagesByChatId: {}, activeChatId: null });
});

it("applies an incoming message and creates the chat", async () => {
  const receive = vi.fn().mockResolvedValueOnce(incomingNotification).mockResolvedValue(null);
  renderHook(() => useNotificationPolling(), { wrapper: wrap(makeClient(receive)) });

  await waitFor(() => {
    expect(useChatStore.getState().chats[0]).toMatchObject({ id: "10000000", title: "Вася" });
  });
  expect(useChatStore.getState().messagesByChatId["10000000"]).toHaveLength(1);
});

it("stops polling on a fatal auth error", async () => {
  const receive = vi.fn().mockRejectedValue(new GreenApiError("unauthorized", 401));
  const { result } = renderHook(() => useNotificationPolling(), {
    wrapper: wrap(makeClient(receive)),
  });

  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(receive).toHaveBeenCalledTimes(1);
});

it("reconnects after a transient network error", async () => {
  const receive = vi.fn().mockRejectedValueOnce(new Error("network down")).mockResolvedValue(null);
  const { result } = renderHook(() => useNotificationPolling(), {
    wrapper: wrap(makeClient(receive)),
  });

  await waitFor(() => expect(result.current.status).toBe("reconnecting"));
  await waitFor(() => expect(result.current.status).toBe("online"), { timeout: 5000 });
});
