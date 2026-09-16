/**
 * Mirrors TMT-BE-V1's order-service — see shared/src/types.ts's OrderDTO
 * (the backend's own declared public contract) and
 * services/order-service/src/db/schema.ts. The DB row carries many more
 * vendor/rider-workflow columns (rejectionReason, riderInfo, prepStartedAt,
 * ...) that the actual API responses include too (Drizzle's `.returning()`
 * sends back the full row) — not modeled here since there's no vendor/rider
 * UI to use them yet; treat `Order` as the customer-relevant subset.
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "rider_arrived"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type PaymentMethod = "wallet" | "pay_on_delivery";

/** Set once a rider accepts the delivery (order-service's riderOrders.ts PUT /:id/accept) — see features/rider/. */
export interface RiderInfo {
  riderId?: string;
  name?: string;
  phone?: string;
  vehicle?: string;
  plateNumber?: string;
  rating?: number;
  photoUrl?: string;
  etaMinutes?: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: string | number;
  /** Added alongside TMT-BE-V1's rewards-service integration — see features/rewards/. */
  paymentMethod?: PaymentMethod;
  paymentStatus?: "pending" | "paid" | "refunded";
  deliveryAddress?: string;
  /** Not in the backend doc's order-service schema yet — added frontend-side for the map feature (components/maps/); absent means no tracking map to show. */
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  /** Shown to the customer once out for delivery, given to the rider to confirm drop-off (features/rider/riderOrdersApi.ts's deliver mutation). */
  deliveryPin?: string | null;
  deliveredAt?: string | null;
  riderInfo?: RiderInfo | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * There's no auth-derived customerId on the backend — no route is actually
 * protected (see authApi.ts's doc comment) — so the caller must supply it
 * explicitly from the signed-in user (`useAuth().user.id`).
 */
export interface CreateOrderPayload {
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalAmount: number;
  /** Defaults to "pay_on_delivery" backend-side if omitted. */
  paymentMethod?: PaymentMethod;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
}
