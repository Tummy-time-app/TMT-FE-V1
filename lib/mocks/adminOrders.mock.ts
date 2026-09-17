import { mockDelay } from "@/lib/dev/devMode";
import { loadOrders, saveOrders, publishNotification } from "./orders.mock";
import type { Order, OrderStatus } from "@/features/orders/types";
import type { Paginated } from "@/features/admin/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Reads/writes the same `tummytime_mock_orders` store every other
 * orders-related mock does. Mirrors adminOrders.ts's real GET / (+ ?status=
 * filter, paginated) and PATCH /:id/override-status.
 * ═══════════════════════════════════════════════════════════════════════
 */
export async function mockListAllOrders(page: number, limit: number, status?: OrderStatus): Promise<Paginated<Order>> {
  await mockDelay();
  let all = loadOrders().slice().sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  if (status) all = all.filter((o) => o.status === status);
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, pagination: { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) } };
}

export async function mockOverrideOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  await mockDelay();
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw { status: 404, message: "Order not found" };
  orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
  saveOrders(orders);
  publishNotification({ event: "ORDER_STATUS_UPDATED", orderId: id, message: `Order #${id.slice(0, 8)} status was overridden to ${status} by an admin` });
  return orders[idx];
}
