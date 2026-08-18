import type { OrderStatus } from "./types";

export type StatusTone = "pending" | "active" | "success" | "stopped";

/** Human-readable label + visual tone for each of order-service's real statuses. */
export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: StatusTone }> = {
  pending: { label: "Placed", tone: "pending" },
  confirmed: { label: "Confirmed", tone: "active" },
  preparing: { label: "Preparing", tone: "active" },
  ready_for_pickup: { label: "Ready for pickup", tone: "active" },
  rider_arrived: { label: "Rider arrived", tone: "active" },
  picked_up: { label: "Picked up", tone: "active" },
  out_for_delivery: { label: "Out for delivery", tone: "active" },
  delivered: { label: "Delivered", tone: "success" },
  rejected: { label: "Rejected", tone: "stopped" },
  cancelled: { label: "Cancelled", tone: "stopped" },
};

/**
 * The normal happy-path sequence, for the detail page's progress list.
 * `rider_arrived` is folded into the `picked_up` step visually — showing
 * both as separate rows reads as more precision than a customer needs.
 * `rejected`/`cancelled` are terminal off-ramps, not part of this list —
 * the detail page shows those as a standalone stopped state instead.
 */
export const ORDER_JOURNEY: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "picked_up",
  "out_for_delivery",
  "delivered",
];

/**
 * Once a vendor starts actually preparing food, letting the customer
 * cancel from the app stops making sense — matches common practice in
 * real delivery apps. There's no backend rule enforcing this; it's a
 * frontend judgment call, easy to loosen later if the product wants to.
 */
export const CANCELABLE_STATUSES: OrderStatus[] = ["pending", "confirmed"];
