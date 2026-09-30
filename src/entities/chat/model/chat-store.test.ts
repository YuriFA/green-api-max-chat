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

it("adds a pending message and confirms it", () => {
  const { addPendingMessage, confirmMessage } = useChatStore.getState();
  const clientId = addPendingMessage("1", "привет", Date.now());
  expect(useChatStore.getState().messagesByChatId["1"][0].status).toBe("pending");

  confirmMessage(clientId, "m1");
  expect(useChatStore.getState().messagesByChatId["1"][0]).toMatchObject({
    idMessage: "m1",
    status: "sent",
  });
});

it("deduplicates redelivered remote messages by idMessage", () => {
  const { upsertRemoteMessage } = useChatStore.getState();
  upsertRemoteMessage("1", { idMessage: "m1", direction: "in", text: "привет", timestamp: 1 });
  upsertRemoteMessage("1", { idMessage: "m1", direction: "in", text: "привет", timestamp: 1 });
  expect(useChatStore.getState().messagesByChatId["1"]).toHaveLength(1);
});
