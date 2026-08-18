import { mockDelay } from "@/lib/dev/devMode";
import type { CreateOrderPayload, Order, OrderStatus } from "@/features/orders/types";
import type { NotificationLogEntry } from "@/features/notifications/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Backed by localStorage so orders (and the notification log they publish
 * to, mirroring the real RabbitMQ → notification-service pipeline) persist
 * across a reload. Only lib/dev/devMode.ts-gated branches inside
 * ordersApi.ts / notificationsApi.ts import from here.
 * ═══════════════════════════════════════════════════════════════════════
 */

const ORDERS_STORAGE_KEY = "tummytime_mock_orders";
const NOTIFICATIONS_STORAGE_KEY = "tummytime_mock_notifications";

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ORDERS_STORAGE_KEY) ?? "[]") as Order[];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function loadNotifications(): NotificationLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) ?? "[]") as NotificationLogEntry[];
  } catch {
    return [];
  }
}

function publishNotification(entry: Omit<NotificationLogEntry, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  const notifications = loadNotifications();
  notifications.unshift({
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
}

export async function mockCreateOrder(payload: CreateOrderPayload): Promise<Order> {
  await mockDelay();
  if (!payload.items.length) {
    throw { status: 400, message: "Missing required order fields: customerId, restaurantId, items array, totalAmount" };
  }
  const order: Order = {
    id: crypto.randomUUID(),
    customerId: payload.customerId,
    restaurantId: payload.restaurantId,
    items: payload.items,
    status: "pending",
    totalAmount: String(payload.totalAmount),
    deliveryAddress: payload.deliveryAddress || "123 Main St, Apt 4B",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);

  publishNotification({
    event: "ORDER_CREATED",
    orderId: order.id,
    message: `Order #${order.id.slice(0, 8)} placed successfully!`,
  });

  return order;
}

export async function mockListOrders(filter: { customerId?: string; restaurantId?: string }): Promise<Order[]> {
  await mockDelay();
  let orders = loadOrders();
  if (filter.customerId) orders = orders.filter((o) => o.customerId === filter.customerId);
  if (filter.restaurantId) orders = orders.filter((o) => o.restaurantId === filter.restaurantId);
  return orders;
}

export async function mockGetOrder(id: string): Promise<Order> {
  await mockDelay();
  const order = loadOrders().find((o) => o.id === id);
  if (!order) throw { status: 404, message: "Order not found" };
  return order;
}

export async function mockUpdateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  await mockDelay();
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw { status: 404, message: "Order not found" };
  orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
  saveOrders(orders);

  publishNotification({
    event: "ORDER_STATUS_UPDATED",
    orderId: orders[idx].id,
    message: `Order #${orders[idx].id.slice(0, 8)} status updated to ${status}`,
  });

  return orders[idx];
}

export async function mockGetNotifications(): Promise<NotificationLogEntry[]> {
  await mockDelay(200);
  return loadNotifications();
}
