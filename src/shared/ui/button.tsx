import type { ComponentProps } from "react";

import type { VariantProps } from "tailwind-variants";

import { cn, tv } from "@/shared/lib/cn";

const button = tv({
  base: "inline-flex select-none items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40",
  variants: {
    variant: {
      primary: "bg-accent text-white hover:bg-accent/90",
      secondary: "bg-field text-ink hover:bg-black/10",
      ghost: "text-ink-soft hover:bg-field",
    },
    size: {
      md: "h-10 rounded-lg px-4 text-sm",
      lg: "h-12 rounded-xl px-5 text-[15px]",
      xl: "h-[52px] rounded-button px-6 text-[17px]",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "lg",
  },
});

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: VariantProps<typeof button>["variant"];
  size?: VariantProps<typeof button>["size"];
}

export const Button = ({ variant, size, className, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={button({ variant, size, className })} {...props} />
);

export const IconButton = ({
  className,
  label,
  ...props
}: ComponentProps<"button"> & { label: string }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-field focus-visible:outline-2 focus-visible:outline-accent",
      className,
    )}
    {...props}
  />
);
