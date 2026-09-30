import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import type { GreenApiCredentials } from "@/shared/api/green-api/types";

import { loginSchema, type LoginValues } from "./login-schema";

interface LoginFormProps {
  onSubmit: (credentials: GreenApiCredentials) => void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { idInstance: "", apiTokenInstance: "" },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="ID инстанса" error={form.formState.errors.idInstance?.message}>
        <Input
          placeholder="3100000001"
          inputMode="numeric"
          autoComplete="one-time-code"
          {...form.register("idInstance")}
        />
      </Field>
      <Field label="API токен" error={form.formState.errors.apiTokenInstance?.message}>
        <Input
          placeholder="bde035edae3fc00bc116bd11..."
          type="password"
          autoComplete="one-time-code"
          {...form.register("apiTokenInstance")}
        />
      </Field>
      <Button type="submit" size="xl" className="mt-2 w-full">
        Войти
      </Button>
    </form>
  );
};
