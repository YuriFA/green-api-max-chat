import { LoginForm } from "@/features/login/login-form";
import type { GreenApiCredentials } from "@/shared/api/green-api/types";
import { appEnv } from "@/shared/config/app-env";
import { Logo } from "@/shared/ui/logo";

interface LoginViewProps {
  onSubmit: (credentials: GreenApiCredentials) => void;
}

export const LoginView = ({ onSubmit }: LoginViewProps) => (
  <div className="login-backdrop flex h-dvh justify-center overflow-y-auto p-4">
    <div className="login-card my-auto w-full max-w-105 rounded-card p-6 shadow-2xl md:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-1">
          <Logo className="scale-75" />
          <h1 className="text-2xl font-bold">MAX чат</h1>
        </div>
        <p className="mt-1.5 text-[15px] text-ink-muted">
          Отправка и получение сообщений через{"\u00A0"}
          <span className="text-nowrap">GREEN-API</span>
        </p>
      </div>
      {appEnv.isMockEnabled && (
        <p className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-[13px] leading-relaxed text-accent-deep">
          Демонстрационный режим: учётные данные не проверяются, демо-бот отвечает на сообщения
          автоматически
        </p>
      )}
      <div className="mt-6">
        <LoginForm onSubmit={onSubmit} />
      </div>
      <p className="mt-6 text-center text-[13px] leading-relaxed text-ink-muted">
        Учётные данные доступны в{"\u00A0"}
        <a
          className="text-accent hover:underline text-nowrap"
          href="https://green-api.com/"
          target="_blank"
          rel="noreferrer"
        >
          Личном кабинете GREEN-API
        </a>
      </p>
    </div>
  </div>
);
