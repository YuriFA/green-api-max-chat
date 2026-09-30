import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GreenApiError } from "@/shared/api/green-api/green-api-client";
import type { GreenApiClient } from "@/shared/api/green-api/green-api-client";
import { GreenApiProvider } from "@/shared/api/green-api/green-api-context";
import { useChatStore } from "@/entities/chat/model/chat-store";

import { useSendMessage } from "./use-send-message";

const createClientStub = (
  sendMessage: GreenApiClient["sendMessage"] = vi.fn().mockResolvedValue({ idMessage: "m1" }),
): GreenApiClient => ({
  sendMessage,
  receiveNotification: vi.fn().mockResolvedValue(null),
  deleteNotification: vi.fn().mockResolvedValue({ result: true, reason: "" }),
  checkAccount: vi.fn().mockResolvedValue({ kind: "not-found" }),
});

const makeWrapper =
  (client: GreenApiClient) =>
  ({ children }: { children: ReactNode }) => (
    <GreenApiProvider client={client}>{children}</GreenApiProvider>
  );

beforeEach(() => {
  useChatStore.setState({ chats: [], messagesByChatId: {}, activeChatId: null });
});

describe("useSendMessage", () => {
  it("adds a pending message, confirms it with the server id, and resolves", async () => {
    const sendMessage = vi.fn().mockResolvedValue({ idMessage: "server-42" });
    const { result } = renderHook(() => useSendMessage("chat-1"), {
      wrapper: makeWrapper(createClientStub(sendMessage)),
    });

    await act(async () => {
      await result.current.send("привет");
    });

    expect(sendMessage).toHaveBeenCalledWith({ chatId: "chat-1", message: "привет" });
    const messages = useChatStore.getState().messagesByChatId["chat-1"];
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ idMessage: "server-42", status: "sent", text: "привет" });
  });

  it("is true while the request is in flight, false once it resolves", async () => {
    let resolve!: (value: { idMessage: string }) => void;
    const sendMessage = vi
      .fn()
      .mockReturnValue(new Promise<{ idMessage: string }>((r) => (resolve = r)));
    const { result } = renderHook(() => useSendMessage("chat-1"), {
      wrapper: makeWrapper(createClientStub(sendMessage)),
    });

    act(() => {
      void result.current.send("hi");
    });
    await waitFor(() => expect(result.current.isSending).toBe(true));

    await act(async () => resolve({ idMessage: "x" }));
    expect(result.current.isSending).toBe(false);
  });

  it("marks the message as failed and re-throws on API error", async () => {
    const error = new GreenApiError("server error", 500);
    const { result } = renderHook(() => useSendMessage("chat-1"), {
      wrapper: makeWrapper(createClientStub(vi.fn().mockRejectedValue(error))),
    });

    let thrown: unknown;
    await act(async () => {
      thrown = await result.current.send("привет").catch((e: unknown) => e);
    });

    expect(thrown).toBe(error);
    const messages = useChatStore.getState().messagesByChatId["chat-1"];
    expect(messages[0].status).toBe("failed");
  });

  it("clears isSending after a failure", async () => {
    const { result } = renderHook(() => useSendMessage("chat-1"), {
      wrapper: makeWrapper(createClientStub(vi.fn().mockRejectedValue(new Error("network down")))),
    });

    await act(async () => {
      await result.current.send("hi").catch(() => {});
    });

    expect(result.current.isSending).toBe(false);
  });

  it("sends to the correct chat when chatId changes between renders", async () => {
    let chatId = "chat-A";
    const sendMessage = vi.fn().mockResolvedValue({ idMessage: "m1" });
    const { result, rerender } = renderHook(() => useSendMessage(chatId), {
      wrapper: makeWrapper(createClientStub(sendMessage)),
    });

    await act(async () => {
      await result.current.send("first");
    });

    chatId = "chat-B";
    rerender();

    await act(async () => {
      await result.current.send("second");
    });

    expect(sendMessage).toHaveBeenNthCalledWith(1, { chatId: "chat-A", message: "first" });
    expect(sendMessage).toHaveBeenNthCalledWith(2, { chatId: "chat-B", message: "second" });
    expect(useChatStore.getState().messagesByChatId["chat-A"]).toHaveLength(1);
    expect(useChatStore.getState().messagesByChatId["chat-B"]).toHaveLength(1);
  });
});
