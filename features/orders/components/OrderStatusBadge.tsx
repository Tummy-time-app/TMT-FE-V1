import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "../types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  picked_up: "Picked up",
  in_transit: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-info-bg text-info",
  accepted: "bg-info-bg text-info",
  preparing: "bg-warning-bg text-warning",
  ready_for_pickup: "bg-warning-bg text-warning",
  picked_up: "bg-primary/10 text-primary",
  in_transit: "bg-primary/10 text-primary",
  delivered: "bg-success-bg text-success",
  cancelled: "bg-error-bg text-error",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-caption font-semibold",
        STATUS_CLASSES[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
