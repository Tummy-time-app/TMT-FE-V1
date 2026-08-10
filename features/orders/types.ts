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

export type PaymentMethod = "cash_on_delivery" | "bank_transfer";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed";
export type OrderType = "delivery" | "pickup";

export interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  qty: number;
  note?: string;
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
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}

export interface CreateOrderPayload {
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  orderType: OrderType;
  deliveryAddress?: string;
  riderNote?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
}
