import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { IconButton } from "@/shared/ui/button";
import { IconSend } from "@/shared/ui/icons";
import { Textarea } from "@/shared/ui/input";

import { useSendMessage } from "./use-send-message";

const MAX_TEXTAREA_HEIGHT_PX = 160;

interface MessageComposerProps {
  chatId: string;
}

export const MessageComposer = ({ chatId }: MessageComposerProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { send, isSending } = useSendMessage(chatId);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    if (text) {
      element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setText("");
    try {
      await send(trimmed);
    } catch {
      setText(trimmed);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full items-end gap-2 p-3">
        <Textarea
          ref={textareaRef}
          value={text}
          name="message"
          autoComplete="off"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение"
          rows={1}
          aria-label="Текст сообщения"
        />
        <IconButton
          label="Отправить"
          disabled={!text.trim() || isSending}
          onClick={handleSend}
          className="size-12 bg-accent text-white hover:bg-accent/90 disabled:bg-field disabled:text-ink-muted"
        >
          <IconSend className="size-5" />
        </IconButton>
      </div>
    </div>
  );
};
