import { mockDelay } from "@/lib/dev/devMode";
import { loadOrders, saveOrders, publishNotification } from "./orders.mock";
import type { Order, OrderStatus } from "@/features/orders/types";
import type { VendorDashboardMetrics, VendorOrderTab } from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Reads/writes the same `tummytime_mock_orders` localStorage array as
 * orders.mock.ts, so a vendor accepting/rejecting an order here is
 * immediately reflected in the customer's own /orders view, matching how
 * the real backend has both sides reading one `orders` table.
 * ═══════════════════════════════════════════════════════════════════════
 */

/** Mirrors vendorOrders.ts's exact tab → status-set mapping. */
const TAB_STATUSES: Record<VendorOrderTab, OrderStatus[]> = {
  new: ["pending"],
  preparing: ["confirmed", "preparing"],
  ready: ["ready_for_pickup", "rider_arrived"],
  completed: ["picked_up", "out_for_delivery", "delivered"],
  cancelled: ["rejected", "cancelled"],
};

function isSameCalendarDay(iso: string | undefined, reference: Date) {
  if (!iso) return false;
  const d = new Date(iso);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

export async function mockGetVendorDashboard(restaurantId: string): Promise<VendorDashboardMetrics> {
  await mockDelay();
  const allOrders = loadOrders().filter((o) => o.restaurantId === restaurantId);
  const today = new Date();
  const todayOrders = allOrders.filter((o) => isSameCalendarDay(o.createdAt, today));

  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const preparingOrders = allOrders.filter((o) => o.status === "preparing" || o.status === "confirmed");
  const completedOrders = todayOrders.filter((o) => o.status === "delivered" || o.status === "picked_up");

  return {
    todayMetrics: {
      totalOrders: todayOrders.length,
      totalRevenue: completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      pendingCount: pendingOrders.length + preparingOrders.length,
      completedCount: completedOrders.length,
    },
    actionRequired: {
      newOrdersCount: pendingOrders.length,
      // Neither has a real mock data source yet (no stock-alert feed or
      // messaging feature exists in dev mode) — shown as 0 rather than a
      // made-up number.
      lowStockAlertsCount: 0,
      customerMessagesCount: 0,
    },
    recentOrders: allOrders
      .slice()
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 5),
  };
}

export async function mockGetVendorOrders(restaurantId: string, tab: VendorOrderTab): Promise<Order[]> {
  await mockDelay();
  const statuses = TAB_STATUSES[tab];
  return loadOrders()
    .filter((o) => o.restaurantId === restaurantId && statuses.includes(o.status))
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

function updateOrder(id: string, patch: Partial<Order>): Order {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw { status: 404, message: "Order not found" };
  orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  saveOrders(orders);
  return orders[idx];
}

export async function mockAcceptOrder(id: string, _estimatedPrepTime?: number): Promise<Order> {
  await mockDelay();
  const order = updateOrder(id, { status: "preparing" });
  publishNotification({
    event: "ORDER_STATUS_UPDATED",
    orderId: order.id,
    message: `Order #${order.id.slice(0, 8)} accepted and is being prepared`,
  });
  return order;
}

export async function mockRejectOrder(id: string): Promise<Order> {
  await mockDelay();
  const order = updateOrder(id, { status: "rejected" });
  publishNotification({
    event: "ORDER_STATUS_UPDATED",
    orderId: order.id,
    message: `Order #${order.id.slice(0, 8)} was rejected by the store`,
  });
  return order;
}

export async function mockReadyOrder(id: string): Promise<Order> {
  await mockDelay();
  const order = updateOrder(id, { status: "ready_for_pickup" });
  publishNotification({
    event: "ORDER_STATUS_UPDATED",
    orderId: order.id,
    message: `Order #${order.id.slice(0, 8)} is ready for pickup`,
  });
  return order;
}

export async function mockHandoverOrder(id: string): Promise<Order> {
  await mockDelay();
  const order = updateOrder(id, { status: "picked_up" });
  publishNotification({
    event: "ORDER_STATUS_UPDATED",
    orderId: order.id,
    message: `Order #${order.id.slice(0, 8)} was handed over to the rider`,
  });
  return order;
}
