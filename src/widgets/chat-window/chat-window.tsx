import { useChatStore } from "@/entities/chat/model/chat-store";
import { MessageComposer } from "@/features/send-message/message-composer";
import { Avatar } from "@/shared/ui/avatar";

import { MessageList } from "./message-list";

export const ChatWindow = () => {
  const activeChat = useChatStore((state) =>
    state.chats.find((chat) => chat.id === state.activeChatId),
  );
  const messages = useChatStore((state) =>
    state.activeChatId ? state.messagesByChatId[state.activeChatId] : undefined,
  );

  if (!activeChat) {
    return (
      <section className="flex h-dvh min-w-0 flex-1 items-center justify-center bg-surface-sunken">
        <p className="text-center text-sm leading-relaxed text-ink-muted">
          Выберите чат слева
          <br />
          или создайте новый по номеру телефона
        </p>
      </section>
    );
  }

  const displayName = activeChat.contact?.name || activeChat.title;

  return (
    <section className="flex h-dvh min-w-0 flex-1 flex-col bg-surface-sunken">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
        <Avatar
          id={activeChat.id}
          title={displayName}
          src={activeChat.contact?.avatar}
          className="size-9 text-[13px]"
        />
        <h2 className="min-w-0 truncate text-[15px] font-medium">{displayName}</h2>
      </header>
      <MessageList messages={messages} />
      <MessageComposer chatId={activeChat.id} />
    </section>
  );
};
