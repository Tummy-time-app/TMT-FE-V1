import { cn } from "@/lib/utils/cn";
import type { TicketPriority, TicketStatus } from "../types";

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_CLASSES: Record<TicketStatus, string> = {
  open: "bg-info-bg text-info",
  in_progress: "bg-warning-bg text-warning",
  resolved: "bg-success-bg text-success",
  closed: "bg-black/5 text-text-subtle",
};

export function TicketStatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-3 py-1 text-caption font-semibold", STATUS_CLASSES[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_CLASSES: Record<TicketPriority, string> = {
  low: "bg-black/5 text-text-subtle",
  medium: "bg-warning-bg text-warning",
  high: "bg-error-bg text-error",
};

export function TicketPriorityBadge({ priority, className }: { priority: TicketPriority; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-3 py-1 text-caption font-semibold", PRIORITY_CLASSES[priority], className)}>
      {PRIORITY_LABEL[priority]} priority
    </span>
  );
}
