import { useChatStore } from "@/entities/chat/model/chat-store";
import { MessageComposer } from "@/features/send-message/message-composer";
import { cn } from "@/shared/lib/cn";
import { Avatar } from "@/shared/ui/avatar";
import { IconButton } from "@/shared/ui/button";
import { IconChevronLeft } from "@/shared/ui/icons";

import { MessageList } from "./message-list";

export const ChatWindow = () => {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const closeChat = useChatStore((state) => state.closeChat);
  const activeChat = useChatStore((state) =>
    state.chats.find((chat) => chat.id === state.activeChatId),
  );
  const messages = useChatStore((state) =>
    state.activeChatId ? state.messagesByChatId[state.activeChatId] : undefined,
  );

  return (
    <section
      className={cn("h-dvh min-w-0 flex-1 flex-col bg-surface-sunken", {
        "hidden md:flex": activeChatId === null,
        flex: activeChatId !== null,
      })}
    >
      {!activeChat ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-center text-sm leading-relaxed text-ink-muted">
            Выберите чат слева
            <br />
            или создайте новый по номеру телефона
          </p>
        </div>
      ) : (
        <>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 md:gap-3 md:px-4">
            <IconButton
              label="Назад"
              onClick={closeChat}
              className="-ml-1.5 size-11 text-ink-soft hover:bg-field md:hidden"
            >
              <IconChevronLeft className="size-6" />
            </IconButton>
            <Avatar
              id={activeChat.id}
              title={activeChat.contact?.name || activeChat.title}
              src={activeChat.contact?.avatar}
              className="size-9 text-[13px]"
            />
            <h2 className="min-w-0 truncate text-[15px] font-medium">
              {activeChat.contact?.name || activeChat.title}
            </h2>
          </header>
          <MessageList messages={messages} />
          <MessageComposer chatId={activeChat.id} />
        </>
      )}
    </section>
  );
};
