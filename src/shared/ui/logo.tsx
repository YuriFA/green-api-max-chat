import { cn } from "@/shared/lib/cn";

export const Logo = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "relative inline-flex size-12 items-center justify-center rounded-full bg-linear-to-br from-violet-500 via-indigo-500 to-sky-400",
      className,
    )}
  >
    <span className="absolute inset-1.5 rounded-full bg-surface" />
    <span className="relative size-3 rounded-full bg-linear-to-br from-violet-500 via-indigo-500 to-sky-400" />
  </span>
);
