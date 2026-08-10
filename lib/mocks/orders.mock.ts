import { mockDelay } from "@/lib/dev/devMode";
import { VENDORS } from "@/lib/vendordata";
import { DEFAULT_MAP_CENTER, MOCK_DELIVERY_LOCATION } from "@/lib/maps/config";
import type { LatLng } from "@/lib/maps/types";
import type {
  CreateOrderPayload,
  Order,
  OrderStatus,
  OrderStatusEvent,
  PaymentStatus,
  RiderInfo,
} from "@/features/orders/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * Status progression is a hybrid:
 *  - pending → accepted → preparing → ready_for_pickup are real vendor
 *    actions (mockUpdateOrderStatus), stored as timestamps — this is the
 *    part spec §16 wants actual "status transition controls" for, and an
 *    order genuinely sits at "pending" until a vendor acts on it.
 *  - ready_for_pickup → in_transit/picked_up → delivered is *derived*
 *    from elapsed time since `readyAt`, standing in for the rider app
 *    (not built yet — Phase 7) the same way order status as a whole stood
 *    in for Supabase Realtime in Phase 4. Resumable across refreshes for
 *    free, no server-side timer needed.
 */

interface StoredOrder extends CreateOrderPayload {
  id: string;
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  cancelledAt?: string;
}

const ORDERS_STORAGE_KEY = "tummytime_mock_orders";

/** Vendor-driven forward transitions — anything not listed here is rejected. */
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready_for_pickup",
};

const POST_READY_DELIVERY_SCHEDULE: { status: OrderStatus; afterMs: number }[] = [
  { status: "ready_for_pickup", afterMs: 0 },
  { status: "in_transit", afterMs: 20_000 },
  { status: "delivered", afterMs: 50_000 },
];

const POST_READY_PICKUP_SCHEDULE: { status: OrderStatus; afterMs: number }[] = [
  { status: "ready_for_pickup", afterMs: 0 },
  { status: "picked_up", afterMs: 25_000 },
];

const TERMINAL_PAYMENT_STATUSES: OrderStatus[] = ["delivered", "picked_up"];

const RIDER_ASSIGNED_STATUSES: OrderStatus[] = ["accepted", "preparing", "ready_for_pickup", "in_transit", "delivered"];

const RIDER_POOL: Omit<RiderInfo, "location">[] = [
  { id: "rider-1", name: "Ibrahim Musa", phone: "+234 803 111 2222", vehicleType: "bike", rating: 4.8 },
  { id: "rider-2", name: "Chidinma Okafor", phone: "+234 805 333 4444", vehicleType: "bicycle", rating: 4.9 },
  { id: "rider-3", name: "Tunde Bakare", phone: "+234 701 555 6666", vehicleType: "car", rating: 4.7 },
];

function hashToIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % length;
}

function vendorLocationFor(vendorId: string): LatLng {
  return VENDORS.find((v) => v.id === vendorId)?.location ?? DEFAULT_MAP_CENTER;
}

function interpolate(from: LatLng, to: LatLng, progress: number): LatLng {
  return {
    lat: from.lat + (to.lat - from.lat) * progress,
    lng: from.lng + (to.lng - from.lng) * progress,
  };
}

function deriveRider(
  order: StoredOrder,
  status: OrderStatus,
  vendorLocation: LatLng,
  deliveryLocation: LatLng | undefined
): RiderInfo | undefined {
  if (order.orderType !== "delivery" || !RIDER_ASSIGNED_STATUSES.includes(status)) return undefined;

  const base = RIDER_POOL[hashToIndex(order.id, RIDER_POOL.length)];

  if ((status === "in_transit" || status === "delivered") && deliveryLocation && order.readyAt) {
    const readyMs = new Date(order.readyAt).getTime();
    const elapsed = Date.now() - readyMs;
    const transitStart = POST_READY_DELIVERY_SCHEDULE.find((s) => s.status === "in_transit")!.afterMs;
    const transitEnd = POST_READY_DELIVERY_SCHEDULE.find((s) => s.status === "delivered")!.afterMs;
    const progress = Math.min(1, Math.max(0, (elapsed - transitStart) / (transitEnd - transitStart)));
    return { ...base, location: interpolate(vendorLocation, deliveryLocation, progress) };
  }

  // Assigned but hasn't set off yet — sitting at the vendor.
  return { ...base, location: vendorLocation };
}

function loadOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: StoredOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function deriveStatus(order: StoredOrder): { status: OrderStatus; history: OrderStatusEvent[] } {
  const history: OrderStatusEvent[] = [{ status: "pending", at: order.createdAt }];

  if (order.cancelledAt) {
    return { status: "cancelled", history: [...history, { status: "cancelled", at: order.cancelledAt }] };
  }
  if (!order.acceptedAt) {
    return { status: "pending", history };
  }
  history.push({ status: "accepted", at: order.acceptedAt });
  if (!order.preparingAt) {
    return { status: "accepted", history };
  }
  history.push({ status: "preparing", at: order.preparingAt });
  if (!order.readyAt) {
    return { status: "preparing", history };
  }

  // Past "ready" — the rest is time-derived (standing in for the rider app).
  const schedule = order.orderType === "pickup" ? POST_READY_PICKUP_SCHEDULE : POST_READY_DELIVERY_SCHEDULE;
  const readyMs = new Date(order.readyAt).getTime();
  const elapsed = Date.now() - readyMs;

  let status: OrderStatus = "ready_for_pickup";
  for (const step of schedule) {
    if (elapsed >= step.afterMs) {
      status = step.status;
      history.push({ status: step.status, at: new Date(readyMs + step.afterMs).toISOString() });
    }
  }
  return { status, history };
}

function derivePaymentStatus(order: StoredOrder, currentStatus: OrderStatus): PaymentStatus {
  if (currentStatus === "cancelled") return order.paymentMethod === "cash_on_delivery" ? "pending" : "failed";

  if (order.paymentMethod === "cash_on_delivery") {
    return TERMINAL_PAYMENT_STATUSES.includes(currentStatus) ? "paid" : "pending";
  }

  // bank_transfer — simulate a webhook confirming payment ~4s after checkout.
  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  return elapsed >= 4000 ? "paid" : "processing";
}

function hydrate(order: StoredOrder): Order {
  const { status, history } = deriveStatus(order);
  const vendorLocation = vendorLocationFor(order.vendorId);
  const deliveryLocation = order.orderType === "delivery" ? MOCK_DELIVERY_LOCATION : undefined;

  return {
    id: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    vendorId: order.vendorId,
    vendorName: order.vendorName,
    vendorLocation,
    items: order.items,
    orderType: order.orderType,
    deliveryAddress: order.deliveryAddress,
    deliveryLocation,
    riderNote: order.riderNote,
    paymentMethod: order.paymentMethod,
    paymentStatus: derivePaymentStatus(order, status),
    status,
    statusHistory: history,
    rider: deriveRider(order, status, vendorLocation, deliveryLocation),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    createdAt: order.createdAt,
  };
}

export async function mockCreateOrder(payload: CreateOrderPayload): Promise<Order> {
  await mockDelay(900);
  const stored: StoredOrder = {
    ...payload,
    id: `TT-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
  saveOrders([stored, ...loadOrders()]);
  return hydrate(stored);
}

export async function mockGetOrders(customerId: string): Promise<Order[]> {
  await mockDelay(400);
  return loadOrders()
    .filter((o) => o.customerId === customerId)
    .map(hydrate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mockGetVendorOrders(vendorId: string): Promise<Order[]> {
  await mockDelay(400);
  return loadOrders()
    .filter((o) => o.vendorId === vendorId)
    .map(hydrate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mockGetOrder(id: string): Promise<Order> {
  await mockDelay(300);
  const stored = loadOrders().find((o) => o.id === id);
  if (!stored) throw { status: 404, message: "We couldn't find this order." };
  return hydrate(stored);
}

export async function mockCancelOrder(id: string): Promise<Order> {
  await mockDelay(500);
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw { status: 404, message: "We couldn't find this order." };

  const current = hydrate(orders[idx]);
  if (current.status !== "pending" && current.status !== "accepted") {
    throw { status: 422, message: "This order is already being prepared and can no longer be cancelled." };
  }

  orders[idx] = { ...orders[idx], cancelledAt: new Date().toISOString() };
  saveOrders(orders);
  return hydrate(orders[idx]);
}

const STATUS_TIMESTAMP_FIELD: Partial<Record<OrderStatus, keyof StoredOrder>> = {
  accepted: "acceptedAt",
  preparing: "preparingAt",
  ready_for_pickup: "readyAt",
};

/** Vendor action — advances an order exactly one allowed step. */
export async function mockUpdateOrderStatus(id: string, nextStatus: OrderStatus): Promise<Order> {
  await mockDelay(500);
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw { status: 404, message: "We couldn't find this order." };

  const current = hydrate(orders[idx]);
  if (ALLOWED_TRANSITIONS[current.status] !== nextStatus) {
    throw { status: 422, message: `Can't move an order from "${current.status}" to "${nextStatus}".` };
  }

  const field = STATUS_TIMESTAMP_FIELD[nextStatus];
  if (!field) throw { status: 422, message: "Unsupported status transition." };

  orders[idx] = { ...orders[idx], [field]: new Date().toISOString() };
  saveOrders(orders);
  return hydrate(orders[idx]);
}
