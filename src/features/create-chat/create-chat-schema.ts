import { z } from "zod";

import { parsePhone } from "@/shared/lib/phone";

export const createChatSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Укажите номер телефона")
    .superRefine((val, ctx) => {
      const result = parsePhone(val);
      if (!result.ok) {
        ctx.addIssue({ code: "custom", message: result.error });
      }
    }),
});

export type CreateChatValues = z.infer<typeof createChatSchema>;
