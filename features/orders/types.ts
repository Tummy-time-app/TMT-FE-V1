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

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: string | number;
  deliveryAddress?: string;
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
  deliveryAddress?: string;
}
