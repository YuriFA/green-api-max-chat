import { useLayoutEffect, useRef } from "react";

import type { Message } from "@/entities/chat/model/message";

import { MessageBubble } from "./message-bubble";

const SCROLL_THRESHOLD_PX = 80;

interface MessageListProps {
  messages?: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || !messages || messages.length === 0) return;

    const prevLength = prevLengthRef.current;
    prevLengthRef.current = messages.length;

    if (messages.length === prevLength) return;

    const lastMessage = messages[messages.length - 1];
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < SCROLL_THRESHOLD_PX;

    if (isAtBottom || lastMessage?.direction === "out") {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  const list = messages ?? [];

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full flex-col gap-1.5 px-4 py-4">
        {list.length === 0 ? (
          <p className="pt-10 text-center text-sm text-ink-muted">
            Сообщений пока нет. Напишите первым
          </p>
        ) : (
          list.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
      </div>
    </div>
  );
};
