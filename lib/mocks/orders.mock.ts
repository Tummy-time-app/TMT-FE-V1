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
 * Orders don't carry a live server-side timer; instead each order's
 * current status is *derived* from elapsed wall-clock time against a
 * fixed schedule (computeLiveState). That makes progression resumable
 * across refreshes/tabs for free, and is what `useOrderRealtime`'s
 * polling picks up — the honest dev stand-in for the Supabase Realtime
 * subscription the real backend would push (spec §49).
 */

interface StoredOrder extends CreateOrderPayload {
  id: string;
  createdAt: string;
  cancelledAt?: string;
}

const ORDERS_STORAGE_KEY = "tummytime_mock_orders";

const DELIVERY_SCHEDULE: { status: OrderStatus; afterMs: number }[] = [
  { status: "pending", afterMs: 0 },
  { status: "accepted", afterMs: 10_000 },
  { status: "preparing", afterMs: 25_000 },
  { status: "ready_for_pickup", afterMs: 45_000 },
  { status: "in_transit", afterMs: 65_000 },
  { status: "delivered", afterMs: 95_000 },
];

const PICKUP_SCHEDULE: { status: OrderStatus; afterMs: number }[] = [
  { status: "pending", afterMs: 0 },
  { status: "accepted", afterMs: 10_000 },
  { status: "preparing", afterMs: 25_000 },
  { status: "ready_for_pickup", afterMs: 45_000 },
  { status: "picked_up", afterMs: 70_000 },
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

  if ((status === "in_transit" || status === "delivered") && deliveryLocation) {
    const createdMs = new Date(order.createdAt).getTime();
    const elapsed = Date.now() - createdMs;
    const transitStart = DELIVERY_SCHEDULE.find((s) => s.status === "in_transit")!.afterMs;
    const transitEnd = DELIVERY_SCHEDULE.find((s) => s.status === "delivered")!.afterMs;
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
  if (order.cancelledAt) {
    return {
      status: "cancelled",
      history: [{ status: "pending", at: order.createdAt }, { status: "cancelled", at: order.cancelledAt }],
    };
  }

  const schedule = order.orderType === "pickup" ? PICKUP_SCHEDULE : DELIVERY_SCHEDULE;
  const createdMs = new Date(order.createdAt).getTime();
  const elapsed = Date.now() - createdMs;

  let status: OrderStatus = schedule[0].status;
  const history: OrderStatusEvent[] = [];
  for (const step of schedule) {
    if (elapsed >= step.afterMs) {
      status = step.status;
      history.push({ status: step.status, at: new Date(createdMs + step.afterMs).toISOString() });
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

export async function mockGetOrders(): Promise<Order[]> {
  await mockDelay(400);
  return loadOrders()
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
