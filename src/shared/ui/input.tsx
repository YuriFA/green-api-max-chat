import type { ComponentProps } from "react";

import { cn, tv } from "@/shared/lib/cn";

const input = tv({
  base: "h-12 w-full rounded-field bg-field px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-accent",
});

export interface InputProps extends ComponentProps<"input"> {}

export const Input = ({ className, ...props }: InputProps) => (
  <input className={input({ className })} {...props} />
);

export interface TextareaProps extends ComponentProps<"textarea"> {}

export const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea
    className={cn(
      "w-full resize-none rounded-field bg-field px-4 py-3 text-[15px] leading-snug text-ink outline-none placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-accent",
      className,
    )}
    {...props}
  />
);
