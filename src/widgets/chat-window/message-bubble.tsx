import type { Message } from "@/entities/chat/model/message";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format-time";

export const MessageBubble = ({ message }: { message: Message }) => {
  const isOut = message.direction === "out";

  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn("max-w-[68%] rounded-2xl px-3.5 py-2", {
          "rounded-br-md bg-accent text-white": isOut,
          "rounded-bl-md bg-surface text-ink shadow-sm": !isOut,
          "opacity-60": message.status === "pending",
          "opacity-100 ring-1 ring-danger": message.status === "failed",
        })}
      >
        <p className="whitespace-pre-wrap wrap-break-word text-[15px] leading-snug">
          {message.text}
        </p>
        <span
          className={cn("mt-0.5 block text-right text-[11px]", {
            "text-white/70": isOut,
            "text-ink-muted": !isOut,
          })}
        >
          {message.status === "failed" && "Не отправлено · "}
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};
