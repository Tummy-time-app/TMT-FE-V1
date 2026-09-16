import { mockDelay } from "@/lib/dev/devMode";
import { loadOrders, saveOrders, publishNotification } from "./orders.mock";
import { mockSettleOrderRewards } from "./rewards.mock";
import { mockCreditRiderEarnings } from "./riderEarnings.mock";
import type { Order, RiderInfo } from "@/features/orders/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Reads/writes the same `tummytime_mock_orders` localStorage array as
 * orders.mock.ts/vendorOrders.mock.ts, so a rider accepting/delivering an
 * order here is immediately reflected in the customer's and vendor's own
 * views. Unlike the earlier rewards-system dev-mode shortcut (which settled
 * rewards immediately at order creation because no delivery flow existed
 * yet), this now settles rewards — and credits the rider — at the actual
 * delivery-confirmation step, matching the real backend's order.delivered
 * event exactly (see rewards-service/src/events/orderConsumer.ts).
 * ═══════════════════════════════════════════════════════════════════════
 */

function updateOrder(id: string, patch: Partial<Order>): Order {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw { status: 404, message: "Order not found" };
  orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  saveOrders(orders);
  return orders[idx];
}

export async function mockListAvailableDeliveries(): Promise<Order[]> {
  await mockDelay();
  return loadOrders()
    .filter((o) => o.status === "ready_for_pickup" && !o.riderInfo)
    .sort((a, b) => new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime());
}

export async function mockAcceptDelivery(id: string, riderInfo: RiderInfo): Promise<Order> {
  await mockDelay();
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw { status: 404, message: "Order not found" };
  if (orders[idx].riderInfo) {
    throw { status: 409, message: "This delivery has already been claimed by another rider" };
  }
  orders[idx] = { ...orders[idx], riderInfo, updatedAt: new Date().toISOString() };
  saveOrders(orders);
  publishNotification({
    event: "ORDER_STATUS_UPDATED",
    orderId: id,
    message: `A rider is on the way to pick up order #${id.slice(0, 8)}`,
  });
  return orders[idx];
}

export async function mockRiderArrived(id: string): Promise<Order> {
  await mockDelay();
  const order = updateOrder(id, { status: "rider_arrived" });
  publishNotification({ event: "ORDER_STATUS_UPDATED", orderId: id, message: `Rider has arrived at the restaurant for order #${id.slice(0, 8)}` });
  return order;
}

export async function mockRiderPickup(id: string): Promise<Order> {
  await mockDelay();
  const order = updateOrder(id, { status: "out_for_delivery" });
  publishNotification({ event: "ORDER_STATUS_UPDATED", orderId: id, message: `Order #${id.slice(0, 8)} is out for delivery` });
  return order;
}

export async function mockRiderDeliver(id: string, pin: string): Promise<Order> {
  await mockDelay();
  const orders = loadOrders();
  const existing = orders.find((o) => o.id === id);
  if (!existing) throw { status: 404, message: "Order not found" };
  if (!pin || pin !== existing.deliveryPin) {
    throw { status: 400, message: "Incorrect delivery PIN" };
  }

  const order = updateOrder(id, { status: "delivered", deliveredAt: new Date().toISOString() });

  await mockSettleOrderRewards(order.customerId, order.id, Number(order.totalAmount));
  if (order.riderInfo?.riderId) {
    mockCreditRiderEarnings(order.riderInfo.riderId, order.id);
  }

  publishNotification({ event: "ORDER_STATUS_UPDATED", orderId: id, message: `Order #${id.slice(0, 8)} was delivered successfully` });
  return order;
}
