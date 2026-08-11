import { CheckCircle2 } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import type { Order, OrderStatus } from "../types";
import { STATUS_LABEL } from "./OrderStatusBadge";

const DELIVERY_STEPS: OrderStatus[] = ["pending", "accepted", "preparing", "ready_for_pickup", "in_transit", "delivered"];
const PICKUP_STEPS: OrderStatus[] = ["pending", "accepted", "preparing", "ready_for_pickup", "picked_up"];

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <div className="rounded-lg border border-error/30 bg-error-bg px-5 py-4 text-small font-semibold text-error">
        This order was cancelled.
      </div>
    );
  }

  const steps = order.orderType === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
  const doneStatuses = new Set(order.statusHistory.map((e) => e.status));
  const timeFor = (status: OrderStatus) => order.statusHistory.find((e) => e.status === status)?.at;

  return (
    <ol className="rounded-lg border border-border bg-surface p-5">
      {steps.map((step, i) => {
        const done = doneStatuses.has(step);
        const at = timeFor(step);
        const isLast = i === steps.length - 1;
        return (
          <li key={step} className="relative flex gap-3.5 pb-7 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-normal",
                  done ? "border-primary bg-primary text-white" : "border-border-strong bg-surface text-transparent"
                )}
              >
                <CheckCircle2 size={14} />
              </span>
              {!isLast && <span className={cn("mt-1 w-0.5 flex-1", done ? "bg-primary" : "bg-border")} />}
            </div>
            <div className="pt-0.5">
              <p className={cn("text-small font-semibold", done ? "text-text" : "text-text-subtle")}>
                {STATUS_LABEL[step]}
              </p>
              {at && (
                <p className="mt-0.5 text-caption text-text-muted">
                  {new Date(at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
