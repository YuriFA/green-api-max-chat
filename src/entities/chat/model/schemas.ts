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

export const ChatSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.number(),
});

export type Chat = z.infer<typeof ChatSchema>;
