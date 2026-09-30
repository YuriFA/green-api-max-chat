import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export const Field = ({ label, error, children }: FieldProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-ink-soft">{label}</span>
    {children}
    {error && <span className="text-[13px] text-danger">{error}</span>}
  </label>
);
