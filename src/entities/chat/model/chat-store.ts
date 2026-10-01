import { create } from "zustand";

import type { Message, MessageStatus, RemoteMessageInput } from "./message";
import type { Chat, ChatContact } from "./schemas";
import { loadStoredChats, saveStoredChats } from "./stored-chats";

export type { Chat, ChatContact };

interface ChatState {
  chats: Chat[];
  messagesByChatId: Record<string, Message[]>;
  activeChatId: string | null;
  createChat: (chat: Omit<Chat, "createdAt">) => void;
  selectChat: (chatId: string) => void;
  closeChat: () => void;
  upsertRemoteMessage: (chatId: string, input: RemoteMessageInput) => void;
  applyMessageStatus: (chatId: string, idMessage: string, status: MessageStatus) => void;
  addPendingMessage: (chatId: string, text: string, timestamp: number) => string;
  confirmMessage: (clientId: string, idMessage: string) => void;
  failMessage: (clientId: string) => void;
  resetChats: () => void;
}

const STATUS_RANK: Record<MessageStatus, number> = {
  pending: 0,
  sent: 1,
  failed: 2,
  delivered: 3,
  read: 4,
};

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

const storedChats = loadStoredChats();

export const useChatStore = create<ChatState>()((set) => ({
  chats: storedChats?.chats ?? [],
  messagesByChatId: storedChats?.messagesByChatId ?? {},
  activeChatId: storedChats?.activeChatId ?? null,

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

  closeChat: () => set({ activeChatId: null }),

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

  applyMessageStatus: (chatId, idMessage, status) =>
    set((state) => {
      const messages = state.messagesByChatId[chatId];
      const target = messages?.find((message) => message.idMessage === idMessage);
      if (!target || STATUS_RANK[status] <= STATUS_RANK[target.status]) {
        return state;
      }
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: messages.map((message) =>
            message.idMessage === idMessage ? { ...message, status } : message,
          ),
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

useChatStore.subscribe((state) => {
  saveStoredChats({
    chats: state.chats,
    messagesByChatId: state.messagesByChatId,
    activeChatId: state.activeChatId,
  });
});
