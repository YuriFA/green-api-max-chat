import { z } from "zod";

// ── Message ──────────────────────────────────────────────────────────────────

export const MessageDirectionSchema = z.enum(["in", "out"]);
export const MessageStatusSchema = z.enum(["pending", "sent", "failed"]);

export const MessageSchema = z.object({
  id: z.string(),
  idMessage: z.string().nullable(),
  direction: MessageDirectionSchema,
  text: z.string(),
  timestamp: z.number(),
  status: MessageStatusSchema,
});

export type MessageDirection = z.infer<typeof MessageDirectionSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type Message = z.infer<typeof MessageSchema>;

// ── Chat ─────────────────────────────────────────────────────────────────────

export const ChatContactSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
});

export const ChatSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.number(),
  contact: ChatContactSchema.optional(),
});

export type ChatContact = z.infer<typeof ChatContactSchema>;
export type Chat = z.infer<typeof ChatSchema>;

// ── StoredChats ───────────────────────────────────────────────────────────────

export const StoredChatsSchema = z.object({
  chats: z.array(ChatSchema),
  messagesByChatId: z.record(z.string(), z.array(MessageSchema)),
  activeChatId: z.string().nullable(),
});

export type StoredChats = z.infer<typeof StoredChatsSchema>;
