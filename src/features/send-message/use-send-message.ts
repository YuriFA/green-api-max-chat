import { useState } from "react";

import { useGreenApiClient } from "@/shared/api/green-api/green-api-context";
import { useChatStore } from "@/entities/chat/model/chat-store";

export interface UseSendMessageResult {
  send: (text: string) => Promise<void>;
  isSending: boolean;
}

export const useSendMessage = (chatId: string): UseSendMessageResult => {
  const [isSending, setIsSending] = useState(false);
  const client = useGreenApiClient();
  const addPendingMessage = useChatStore((state) => state.addPendingMessage);
  const confirmMessage = useChatStore((state) => state.confirmMessage);
  const failMessage = useChatStore((state) => state.failMessage);

  const send = async (text: string): Promise<void> => {
    setIsSending(true);
    const clientId = addPendingMessage(chatId, text, Date.now());
    try {
      const { idMessage } = await client.sendMessage({ chatId, message: text });
      confirmMessage(clientId, idMessage);
    } catch (error) {
      failMessage(clientId);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return { send, isSending };
};
