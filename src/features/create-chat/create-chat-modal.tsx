import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { GreenApiError } from "@/shared/api/green-api/green-api-client";
import { useGreenApiClient } from "@/shared/api/green-api/green-api-context";
import { formatPhone, parsePhone } from "@/shared/lib/phone";
import { useChatStore } from "@/entities/chat/model/chat-store";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { IconClose } from "@/shared/ui/icons";
import { Spinner } from "@/shared/ui/spinner";

import { createChatSchema, type CreateChatValues } from "./create-chat-schema";
import { fetchChatContact } from "./chat-contact";

interface CreateChatModalProps {
  onClose: () => void;
}

export const CreateChatModal = ({ onClose }: CreateChatModalProps) => {
  const createChat = useChatStore((state) => state.createChat);
  const client = useGreenApiClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const form = useForm<CreateChatValues>({
    resolver: zodResolver(createChatSchema),
    defaultValues: { phone: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    const parsed = parsePhone(values.phone);
    if (!parsed.ok) {
      form.setError("phone", { message: parsed.error });
      return;
    }
    try {
      const outcome = await client.checkAccount({
        phoneNumber: parsed.value,
      });
      if (outcome.kind === "not-found") {
        form.setError("phone", {
          message: "Аккаунт MAX не найден на этом номере",
        });
        return;
      }
      if (outcome.kind === "unavailable") {
        setApiError(`Не удалось проверить номер: ${outcome.reason.toLowerCase()}`);
        return;
      }
      createChat({
        id: outcome.chatId,
        title: formatPhone(parsed.value),
        contact: await fetchChatContact(client, outcome.chatId),
      });
      onClose();
    } catch (error) {
      setApiError(
        error instanceof GreenApiError
          ? `Ошибка GREEN-API (${error.status}): проверьте учётные данные`
          : "Не удалось проверить номер. Попробуйте ещё раз",
      );
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Новый чат"
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-100 rounded-card bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Новый чат</h2>
            <p className="mt-1 text-sm text-ink-muted">Укажите номер телефона получателя</p>
          </div>
          <button
            className="-mr-2 -mt-1 flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-field hover:text-ink"
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <IconClose className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4" noValidate>
          <Field label="Номер телефона" error={errors.phone?.message}>
            <Input
              autoFocus
              placeholder="+7 999 123 45 67"
              inputMode="tel"
              {...form.register("phone")}
            />
          </Field>
          {apiError && <p className="mt-2 text-[13px] text-danger">{apiError}</p>}
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="size-4" /> : "Создать"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
