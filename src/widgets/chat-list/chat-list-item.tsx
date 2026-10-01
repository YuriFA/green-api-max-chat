import type { Message } from "@/entities/chat/model/message";
import type { Chat } from "@/entities/chat/model/chat-store";
import { MessageStatusTicks } from "@/entities/chat/ui/message-status";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format-time";
import { Avatar } from "@/shared/ui/avatar";

interface ChatListItemProps {
  chat: Chat;
  lastMessage: Message | null;
  isActive: boolean;
  onSelect: () => void;
}

export const ChatListItem = ({ chat, lastMessage, isActive, onSelect }: ChatListItemProps) => {
  const displayName = chat.contact?.name || chat.title;
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        {
          "bg-accent-soft": isActive,
          "hover:bg-field": !isActive,
        },
      )}
      type="button"
      onClick={onSelect}
    >
      <Avatar id={chat.id} title={displayName} src={chat.contact?.avatar} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-medium text-ink">{displayName}</span>
          {lastMessage && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-ink-muted">
              {lastMessage.direction === "out" && (
                <MessageStatusTicks status={lastMessage.status} />
              )}
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-sm text-ink-muted">
          {lastMessage
            ? `${lastMessage.direction === "out" ? "Вы: " : ""}${lastMessage.text}`
            : "Нет сообщений"}
        </span>
      </span>
    </button>
  );
};
