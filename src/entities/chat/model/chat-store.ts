import { create } from "zustand";

import type { Message, RemoteMessageInput } from "./message";
import type { Chat } from "./schemas";

export type { Chat };

interface ChatState {
  chats: Chat[];
  messagesByChatId: Record<string, Message[]>;
  activeChatId: string | null;
  createChat: (chat: Omit<Chat, "createdAt">) => void;
  selectChat: (chatId: string) => void;
  upsertRemoteMessage: (chatId: string, input: RemoteMessageInput) => void;
  addPendingMessage: (chatId: string, text: string, timestamp: number) => string;
  confirmMessage: (clientId: string, idMessage: string) => void;
  failMessage: (clientId: string) => void;
  resetChats: () => void;
}

const mapMessage = (
  messagesByChatId: Record<string, Message[]>,
  clientId: string,
  patch: Partial<Message>,
): Record<string, Message[]> =>
  Object.fromEntries(
    Object.entries(messagesByChatId).map(([chatId, messages]) => [
      chatId,
      messages.map((message) => (message.id === clientId ? { ...message, ...patch } : message)),
    ]),
  );

export const useChatStore = create<ChatState>()((set) => ({
  chats: [],
  messagesByChatId: {},
  activeChatId: null,

  resetChats: () => set({ chats: [], messagesByChatId: {}, activeChatId: null }),

  createChat: (chatInput) =>
    set((state) => {
      if (state.chats.some((existing) => existing.id === chatInput.id)) {
        return { activeChatId: chatInput.id };
      }
      const chat: Chat = { ...chatInput, createdAt: Date.now() };
      return {
        chats: [...state.chats, chat],
        activeChatId: chat.id,
      };
    }),

  selectChat: (chatId) => set({ activeChatId: chatId }),

  upsertRemoteMessage: (chatId, input) =>
    set((state) => {
      const messages = state.messagesByChatId[chatId] ?? [];
      if (messages.some((message) => message.idMessage === input.idMessage)) {
        return state;
      }
      const message: Message = {
        id: crypto.randomUUID(),
        status: "sent",
        ...input,
      };
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...messages, message],
        },
      };
    }),

  addPendingMessage: (chatId, text, timestamp) => {
    const clientId = crypto.randomUUID();
    set((state) => {
      const messages = state.messagesByChatId[chatId] ?? [];
      const message: Message = {
        id: clientId,
        idMessage: null,
        direction: "out",
        text,
        timestamp,
        status: "pending",
      };
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...messages, message],
        },
      };
    });
    return clientId;
  },

  confirmMessage: (clientId, idMessage) =>
    set((state) => ({
      messagesByChatId: mapMessage(state.messagesByChatId, clientId, {
        idMessage,
        status: "sent",
      }),
    })),

  failMessage: (clientId) =>
    set((state) => ({
      messagesByChatId: mapMessage(state.messagesByChatId, clientId, {
        status: "failed",
      }),
    })),
}));
