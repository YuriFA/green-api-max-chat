import { beforeEach, expect, it } from "vitest";

import { useChatStore } from "./chat-store";

beforeEach(() => {
  window.localStorage.clear();
  useChatStore.setState({ chats: [], messagesByChatId: {}, activeChatId: null });
});

it("creates a chat and selects it", () => {
  useChatStore.getState().createChat({ id: "10000000", title: "+7 999 123-45-67" });
  const state = useChatStore.getState();
  expect(state.chats).toHaveLength(1);
  expect(state.activeChatId).toBe("10000000");
});

it("adds a pending message, confirms it, and advances status to read", () => {
  const { addPendingMessage, confirmMessage, applyMessageStatus } = useChatStore.getState();
  const clientId = addPendingMessage("1", "привет", Date.now());
  expect(useChatStore.getState().messagesByChatId["1"][0].status).toBe("pending");

  confirmMessage(clientId, "m1");
  expect(useChatStore.getState().messagesByChatId["1"][0]).toMatchObject({
    idMessage: "m1",
    status: "sent",
  });

  applyMessageStatus("1", "m1", "delivered");
  applyMessageStatus("1", "m1", "read");
  expect(useChatStore.getState().messagesByChatId["1"][0].status).toBe("read");
});

it("does not downgrade a read message to delivered", () => {
  const { upsertRemoteMessage, applyMessageStatus } = useChatStore.getState();
  upsertRemoteMessage("1", { idMessage: "m1", direction: "out", text: "hi", timestamp: 1 });
  applyMessageStatus("1", "m1", "read");
  applyMessageStatus("1", "m1", "delivered");
  expect(useChatStore.getState().messagesByChatId["1"][0].status).toBe("read");
});

it("deduplicates redelivered remote messages by idMessage", () => {
  const { upsertRemoteMessage } = useChatStore.getState();
  upsertRemoteMessage("1", { idMessage: "m1", direction: "in", text: "привет", timestamp: 1 });
  upsertRemoteMessage("1", { idMessage: "m1", direction: "in", text: "привет", timestamp: 1 });
  expect(useChatStore.getState().messagesByChatId["1"]).toHaveLength(1);
});
