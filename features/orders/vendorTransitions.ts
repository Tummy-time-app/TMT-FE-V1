import type { OrderStatus, OrderType } from "./types";

export interface VendorAction {
  label: string;
  nextStatus: OrderStatus;
}

const NEXT_ACTION: Partial<Record<OrderStatus, VendorAction>> = {
  pending: { label: "Accept order", nextStatus: "accepted" },
  accepted: { label: "Start preparing", nextStatus: "preparing" },
  preparing: { label: "Mark ready", nextStatus: "ready_for_pickup" },
};

/** The one forward action a vendor can take from `status`, or null once it's out of their hands. */
export function getVendorAction(status: OrderStatus): VendorAction | null {
  return NEXT_ACTION[status] ?? null;
}

export function canReject(status: OrderStatus): boolean {
  return status === "pending" || status === "accepted";
}

export function waitingMessage(status: OrderStatus, orderType: OrderType): string | null {
  if (status !== "ready_for_pickup") return null;
  return orderType === "pickup"
    ? "Waiting for the customer to pick up their order."
    : "Waiting for a rider to pick up this order.";
}
