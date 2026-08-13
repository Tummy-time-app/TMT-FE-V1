import { mockDelay } from "@/lib/dev/devMode";
import { VENDORS, SHOP_VENDORS, MARKET_VENDORS } from "@/lib/vendordata";

/** Every static seed vendor across all three business types. */
const ALL_STATIC_VENDORS = [...VENDORS, ...SHOP_VENDORS, ...MARKET_VENDORS];
import { DEFAULT_MAP_CENTER, MOCK_DELIVERY_LOCATION } from "@/lib/maps/config";
import { chargeWalletInternal } from "@/lib/mocks/wallet.mock";
import { mockRedeemPromoCode } from "@/lib/mocks/promotions.mock";
import { findVendorOwnerId } from "@/lib/mocks/auth.mock";
import { pushNotificationInternal } from "@/lib/mocks/notifications.mock";
import type { LatLng } from "@/lib/maps/types";
import type {
  CreateOrderPayload,
  Order,
  OrderStatus,
  OrderStatusEvent,
  PaymentStatus,
  RiderInfo,
  VehicleType,
} from "@/features/orders/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * Status progression is a three-part hybrid:
 *  - pending → accepted → preparing → ready_for_pickup are real VENDOR
 *    actions (mockUpdateOrderStatus), stored as timestamps.
 *  - For delivery orders, ready_for_pickup → in_transit → delivered are
 *    real RIDER actions (mockClaimDelivery / mockMarkDelivered) — a
 *    delivery sits at "ready_for_pickup", visible to every rider, until
 *    one of them actually claims it. This is spec §21's real "incoming
 *    delivery requests" flow, not a fake queue.
 *  - For pickup orders (no rider involved), ready_for_pickup → picked_up
 *    stays time-derived, standing in for the customer physically
 *    collecting their order.
 */

interface StoredOrder extends CreateOrderPayload {
  id: string;
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  cancelledAt?: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicleType?: VehicleType;
  claimedAt?: string;
  deliveredAt?: string;
  /** Real GPS reported by the rider's browser, when available — see hooks/useGeolocationWatch.ts. */
  manualRiderLocation?: LatLng;
  proofNote?: string;
}

const ORDERS_STORAGE_KEY = "tummytime_mock_orders";

/** Vendor-driven forward transitions — anything not listed here is rejected. */
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready_for_pickup",
};

const PICKUP_COLLECTION_DELAY_MS = 25_000;
/** How long a simulated (no real GPS yet) rider takes to cross town, for the progress bar fallback. */
const SIMULATED_TRANSIT_DURATION_MS = 40_000;

const TERMINAL_PAYMENT_STATUSES: OrderStatus[] = ["delivered", "picked_up"];

function vendorLocationFor(vendorId: string): LatLng {
  return ALL_STATIC_VENDORS.find((v) => v.id === vendorId)?.location ?? DEFAULT_MAP_CENTER;
}

function interpolate(from: LatLng, to: LatLng, progress: number): LatLng {
  return {
    lat: from.lat + (to.lat - from.lat) * progress,
    lng: from.lng + (to.lng - from.lng) * progress,
  };
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
  if (!order.acceptedAt) return { status: "pending", history };
  history.push({ status: "accepted", at: order.acceptedAt });

  if (!order.preparingAt) return { status: "accepted", history };
  history.push({ status: "preparing", at: order.preparingAt });

  if (!order.readyAt) return { status: "preparing", history };
  history.push({ status: "ready_for_pickup", at: order.readyAt });

  if (order.orderType === "pickup") {
    const readyMs = new Date(order.readyAt).getTime();
    if (Date.now() - readyMs >= PICKUP_COLLECTION_DELAY_MS) {
      history.push({ status: "picked_up", at: new Date(readyMs + PICKUP_COLLECTION_DELAY_MS).toISOString() });
      return { status: "picked_up", history };
    }
    return { status: "ready_for_pickup", history };
  }

  // Delivery — the rest is rider-driven, not simulated.
  if (!order.claimedAt) return { status: "ready_for_pickup", history };
  history.push({ status: "in_transit", at: order.claimedAt });

  if (!order.deliveredAt) return { status: "in_transit", history };
  history.push({ status: "delivered", at: order.deliveredAt });
  return { status: "delivered", history };
}

function derivePaymentStatus(order: StoredOrder, currentStatus: OrderStatus): PaymentStatus {
  if (currentStatus === "cancelled") return order.paymentMethod === "cash_on_delivery" ? "pending" : "failed";

  if (order.paymentMethod === "cash_on_delivery") {
    return TERMINAL_PAYMENT_STATUSES.includes(currentStatus) ? "paid" : "pending";
  }

  // wallet — charged atomically at order creation (see mockCreateOrder), so it's paid the instant the order exists.
  if (order.paymentMethod === "wallet") return "paid";

  // bank_transfer and card — simulate a provider webhook confirming payment ~4s after checkout (doc §8: never trust the client's word, only a webhook/verify call marks an order paid).
  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  return elapsed >= 4000 ? "paid" : "processing";
}

function deriveRider(
  order: StoredOrder,
  status: OrderStatus,
  vendorLocation: LatLng,
  deliveryLocation: LatLng | undefined
): RiderInfo | undefined {
  if (order.orderType !== "delivery" || !order.riderId) return undefined;

  const base: Omit<RiderInfo, "location"> = {
    id: order.riderId,
    name: order.riderName ?? "Rider",
    phone: order.riderPhone ?? "",
    vehicleType: order.riderVehicleType ?? "bike",
    rating: 4.8,
  };

  if (status === "delivered" && deliveryLocation) {
    return { ...base, location: deliveryLocation };
  }

  if (status === "in_transit") {
    if (order.manualRiderLocation) return { ...base, location: order.manualRiderLocation };

    // No real GPS reported yet — simulate movement toward the customer.
    if (deliveryLocation && order.claimedAt) {
      const claimedMs = new Date(order.claimedAt).getTime();
      const progress = Math.min(1, Math.max(0, (Date.now() - claimedMs) / SIMULATED_TRANSIT_DURATION_MS));
      return { ...base, location: interpolate(vendorLocation, deliveryLocation, progress) };
    }
  }

  return { ...base, location: vendorLocation };
}

function hydrate(order: StoredOrder): Order {
  const { status, history } = deriveStatus(order);
  const vendorLocation = vendorLocationFor(order.vendorId);
  // Prefer the customer's actual selected address (features/addresses) over the fixed mock point, when one was recorded.
  const deliveryLocation = order.orderType === "delivery" ? order.deliveryLocation ?? MOCK_DELIVERY_LOCATION : undefined;

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
    proofNote: order.proofNote,
    promoCode: order.promoCode,
    discount: order.discount,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    createdAt: order.createdAt,
  };
}

export async function mockCreateOrder(payload: CreateOrderPayload): Promise<Order> {
  await mockDelay(900);

  // Wallet orders charge atomically here — insufficient funds aborts order
  // creation entirely, so there's never an order left in a half-paid state.
  if (payload.paymentMethod === "wallet") {
    chargeWalletInternal(payload.customerId, payload.total, `Order at ${payload.vendorName}`);
  }

  const stored: StoredOrder = {
    ...payload,
    id: `TT-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
  saveOrders([stored, ...loadOrders()]);

  if (payload.promoCode) {
    await mockRedeemPromoCode(payload.promoCode);
  }

  const vendorOwnerId = findVendorOwnerId(payload.vendorId);
  if (vendorOwnerId) {
    pushNotificationInternal(vendorOwnerId, {
      type: "order",
      title: "New order received",
      message: `${payload.customerName} placed an order for ₦${payload.total.toLocaleString("en-NG")}.`,
      link: `/vendor/orders/${stored.id}`,
    });
  }

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

/** Admin — every order on the platform. */
export async function mockGetAllOrders(): Promise<Order[]> {
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

  pushNotificationInternal(orders[idx].customerId, {
    type: "order",
    title: "Order cancelled",
    message: `Your order from ${orders[idx].vendorName} was cancelled.`,
    link: `/orders/${id}`,
  });

  return hydrate(orders[idx]);
}

const STATUS_NOTIFICATION_MESSAGE: Partial<Record<OrderStatus, string>> = {
  accepted: "has been accepted by the vendor.",
  preparing: "is being prepared.",
  ready_for_pickup: "is ready — waiting for a rider.",
};

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

  const message = STATUS_NOTIFICATION_MESSAGE[nextStatus];
  if (message) {
    pushNotificationInternal(orders[idx].customerId, {
      type: "order",
      title: "Order update",
      message: `Your order from ${orders[idx].vendorName} ${message}`,
      link: `/orders/${id}`,
    });
  }

  return hydrate(orders[idx]);
}

/** Every ready-for-pickup delivery not yet claimed by a rider — the rider dashboard's incoming feed. */
export async function mockGetAvailableDeliveries(): Promise<Order[]> {
  await mockDelay(400);
  return loadOrders()
    .filter((o) => o.orderType === "delivery" && !o.cancelledAt && o.readyAt && !o.riderId)
    .map(hydrate)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** A specific rider's own deliveries (active + past). */
export async function mockGetRiderOrders(riderId: string): Promise<Order[]> {
  await mockDelay(400);
  return loadOrders()
    .filter((o) => o.riderId === riderId)
    .map(hydrate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface ClaimDeliveryInput {
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderVehicleType: VehicleType;
}

export async function mockClaimDelivery(orderId: string, rider: ClaimDeliveryInput): Promise<Order> {
  await mockDelay(500);
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw { status: 404, message: "We couldn't find this delivery." };

  const current = hydrate(orders[idx]);
  if (current.orderType !== "delivery" || current.status !== "ready_for_pickup") {
    throw { status: 422, message: "This delivery is no longer available." };
  }
  if (orders[idx].riderId) {
    throw { status: 409, message: "Another rider already claimed this delivery." };
  }

  orders[idx] = {
    ...orders[idx],
    riderId: rider.riderId,
    riderName: rider.riderName,
    riderPhone: rider.riderPhone,
    riderVehicleType: rider.riderVehicleType,
    claimedAt: new Date().toISOString(),
  };
  saveOrders(orders);

  pushNotificationInternal(orders[idx].customerId, {
    type: "order",
    title: "Rider on the way",
    message: `${rider.riderName} picked up your order from ${orders[idx].vendorName}.`,
    link: `/orders/${orderId}`,
  });

  return hydrate(orders[idx]);
}

export async function mockMarkDelivered(orderId: string, riderId: string, proofNote: string): Promise<Order> {
  await mockDelay(600);
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw { status: 404, message: "We couldn't find this delivery." };
  if (orders[idx].riderId !== riderId) throw { status: 403, message: "This isn't your delivery." };

  const current = hydrate(orders[idx]);
  if (current.status !== "in_transit") {
    throw { status: 422, message: "This delivery isn't in transit." };
  }

  orders[idx] = { ...orders[idx], deliveredAt: new Date().toISOString(), proofNote };
  saveOrders(orders);

  pushNotificationInternal(orders[idx].customerId, {
    type: "order",
    title: "Order delivered",
    message: `Your order from ${orders[idx].vendorName} has been delivered. Enjoy!`,
    link: `/orders/${orderId}`,
  });

  return hydrate(orders[idx]);
}

/** Fired frequently from the rider's geolocation watcher — no artificial delay. */
export async function mockUpdateRiderLocation(orderId: string, riderId: string, location: LatLng): Promise<Order> {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw { status: 404, message: "We couldn't find this delivery." };
  if (orders[idx].riderId !== riderId) throw { status: 403, message: "This isn't your delivery." };

  orders[idx] = { ...orders[idx], manualRiderLocation: location };
  saveOrders(orders);
  return hydrate(orders[idx]);
}
