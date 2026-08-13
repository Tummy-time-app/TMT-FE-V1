import type { LatLng } from "@/lib/maps/types";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready_for_pickup"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

/**
 * Doc §4 also lists "card" (Paystack/Flutterwave checkout) alongside these
 * three. Kept in the type for contract completeness, but checkout's UI
 * still only offers the three below — a real card-payment flow needs a
 * live payment gateway to build against meaningfully (see
 * backend-alignment-phases memory).
 */
export type PaymentMethod = "cash_on_delivery" | "bank_transfer" | "wallet" | "card";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed";
export type OrderType = "delivery" | "pickup";
export type CancelledBy = "customer" | "vendor" | "rider" | "admin";

export interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  qty: number;
  note?: string;
  /** Carried through from the cart item for grocery orders — see lib/utils/quantity.ts. */
  unitType?: "each" | "weight";
  weightUnit?: "g" | "kg";
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
}

export type VehicleType = "bike" | "bicycle" | "car";

export interface RiderInfo {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  rating: number;
  /** null until the rider has actually set off (in_transit). */
  location: LatLng | null;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  vendorLocation: LatLng;
  items: OrderItem[];
  orderType: OrderType;
  deliveryAddress?: string;
  deliveryLocation?: LatLng;
  riderNote?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  rider?: RiderInfo;
  /** Proof-of-delivery note the rider leaves when marking the order delivered. */
  proofNote?: string;
  promoCode?: string;
  discount?: number;
  subtotal: number;
  deliveryFee: number;
  /** Maps to `orders.service_fee` — platform fee distinct from the delivery fee. Defaults to 0 in dev mode so displayed totals stay consistent (see backend-alignment-phases memory: not surfaced as its own line item in cart/checkout UI yet). */
  serviceFee?: number;
  /** Maps to `orders.tax`. Same "not yet its own UI line item" note as `serviceFee`. */
  tax?: number;
  total: number;
  createdAt: string;
  /** Maps to `orders.scheduled_for` — set for a scheduled (not "now") order. Scheduling isn't built in checkout yet; the field exists for contract completeness. */
  scheduledFor?: string;
  cancellationReason?: string;
  cancelledBy?: CancelledBy;
  /** Maps to `orders.proof_of_delivery_pin` — a short code the customer gives the rider at handoff, alternative/supplement to `proofNote`. Not yet asked for anywhere in the delivery-confirmation UI. */
  proofOfDeliveryPin?: string;
}

export interface CreateOrderPayload {
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  orderType: OrderType;
  deliveryAddress?: string;
  /** The selected saved address's coordinates (see features/addresses) — drives where the tracking map animates the rider to. */
  deliveryLocation?: LatLng;
  riderNote?: string;
  paymentMethod: PaymentMethod;
  scheduledFor?: string;
  promoCode?: string;
  discount?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}
