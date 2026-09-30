import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

export { tv };

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
