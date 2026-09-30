import { cn } from "@/shared/lib/cn";

export const Spinner = ({ className }: { className?: string }) => (
  <span
    role="status"
    aria-label="Загрузка"
    className={cn(
      "inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent",
      className,
    )}
  />
);
