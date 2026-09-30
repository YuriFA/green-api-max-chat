import { ChatList } from "@/widgets/chat-list/chat-list";
import { ChatWindow } from "@/widgets/chat-window/chat-window";

interface ChatViewProps {
  onLogout: () => void;
}

export const ChatView = ({ onLogout }: ChatViewProps) => (
  <div className="flex h-dvh overflow-hidden">
    <ChatList onLogout={onLogout} />
    <ChatWindow />
  </div>
);
