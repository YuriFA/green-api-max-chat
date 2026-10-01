import { useMemo, useState } from "react";

import {
  useNotificationPolling,
  type PollingStatus,
} from "@/features/receive-messages/use-notification-polling";
import { CreateChatModal } from "@/features/create-chat/create-chat-modal";
import { useChatStore, type Chat } from "@/entities/chat/model/chat-store";
import type { Message } from "@/entities/chat/model/message";
import { IconButton } from "@/shared/ui/button";
import { IconLogout, IconPlus } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

import { ChatListItem } from "./chat-list-item";

const getLastActivity = (chat: Chat, messages: Message[] | undefined) =>
  messages?.at(-1)?.timestamp ?? chat.createdAt;

const statusText: Record<PollingStatus, string> = {
  online: "Подключено",
  reconnecting: "Переподключение…",
  error: "Ошибка подключения",
};

const statusColor: Record<PollingStatus, string> = {
  online: "bg-emerald-500",
  reconnecting: "bg-amber-500",
  error: "bg-danger",
};

export const ChatList = ({ onLogout }: { onLogout: () => void }) => {
  const polling = useNotificationPolling();
  const chats = useChatStore((state) => state.chats);
  const messagesByChatId = useChatStore((state) => state.messagesByChatId);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const selectChat = useChatStore((state) => state.selectChat);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const sortedChats = useMemo(
    () =>
      [...chats].sort(
        (a, b) =>
          getLastActivity(b, messagesByChatId[b.id]) - getLastActivity(a, messagesByChatId[a.id]),
      ),
    [chats, messagesByChatId],
  );

  return (
    <aside
      className={cn("h-dvh w-full flex-col border-r border-border bg-surface md:w-90 md:shrink-0", {
        flex: activeChatId === null,
        "hidden md:flex": activeChatId !== null,
      })}
    >
      <header className="flex h-14 shrink-0 items-center justify-between pl-6 pr-3">
        <h1 className="text-lg font-semibold">Чаты</h1>
        <IconButton
          className="size-11 text-accent hover:bg-accent-soft md:size-10"
          label="Новый чат"
          onClick={() => setIsCreateOpen(true)}
        >
          <IconPlus className="size-6" />
        </IconButton>
      </header>
      <nav className="flex-1 overflow-y-auto px-2 pb-2" aria-label="Список чатов">
        {sortedChats.length === 0 ? (
          <p className="px-4 pt-8 text-center text-sm leading-relaxed text-ink-muted">
            Пока нет чатов.
            <br />
            Создайте новый по номеру телефона получателя
          </p>
        ) : (
          sortedChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              lastMessage={messagesByChatId[chat.id]?.at(-1) ?? null}
              isActive={chat.id === activeChatId}
              onSelect={() => selectChat(chat.id)}
            />
          ))
        )}
      </nav>
      <footer className="flex h-12 shrink-0 items-center justify-between border-t border-border px-4">
        <span className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span className={`size-2 rounded-full ${statusColor[polling.status]}`} />
          {polling.errorMessage ?? statusText[polling.status]}
        </span>
        <button
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-muted transition-colors hover:bg-field hover:text-ink"
          type="button"
          onClick={onLogout}
        >
          <IconLogout className="size-4" />
          Выйти
        </button>
      </footer>
      {isCreateOpen && <CreateChatModal onClose={() => setIsCreateOpen(false)} />}
    </aside>
  );
};
