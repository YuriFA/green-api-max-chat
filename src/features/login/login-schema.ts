import { z } from "zod";

export const loginSchema = z.object({
  idInstance: z
    .string()
    .trim()
    .min(1, "Укажите ID инстанса")
    .regex(/^\d{4,}$/, "ID инстанса состоит из цифр, например 3100000001"),
  apiTokenInstance: z
    .string()
    .trim()
    .min(1, "Укажите API токен")
    .min(16, "Токен выглядит слишком коротким"),
});

export type LoginValues = z.infer<typeof loginSchema>;
