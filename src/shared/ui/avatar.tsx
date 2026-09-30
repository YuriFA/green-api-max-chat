import { cn } from "@/shared/lib/cn";
import { IconUser } from "@/shared/ui/icons";

const gradients = [
  "from-violet-500 to-sky-400",
  "from-rose-400 to-orange-400",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-500 to-pink-500",
  "from-indigo-500 to-purple-500",
  "from-amber-400 to-red-400",
] as const;

const hashId = (id: string): number => {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
};

const getInitials = (title: string): string =>
  title
    .split(/\s+/)
    .filter((word) => /[a-zа-яё]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

export interface AvatarProps {
  id: string;
  title: string;
  className?: string;
}

export const Avatar = ({ id, title, className }: AvatarProps) => {
  const initials = getInitials(title);
  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br text-[15px] font-semibold text-white",
        gradients[hashId(id) % gradients.length],
        className,
      )}
    >
      {initials ? initials : <IconUser className="size-5 opacity-90" />}
    </span>
  );
};
