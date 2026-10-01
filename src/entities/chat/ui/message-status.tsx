import type { MessageStatus } from "../model/message";
import { cn } from "@/shared/lib/cn";
import { IconCheck, IconCheckDouble, IconClock } from "@/shared/ui/icons";

export const MessageStatusTicks = ({
  status,
  className,
}: {
  status: MessageStatus;
  className?: string;
}) => {
  if (status === "read") {
    return <IconCheckDouble className={cn("size-3.5 shrink-0", className)} />;
  }
  if (status === "delivered") {
    return <IconCheck className={cn("size-3.5 shrink-0", className)} />;
  }
  if (status === "sent") {
    return <IconCheck className={cn("size-3.5 shrink-0 text-ink-muted", className)} />;
  }
  if (status === "pending") {
    return <IconClock className={cn("size-3 shrink-0", className)} />;
  }
  return null;
};
