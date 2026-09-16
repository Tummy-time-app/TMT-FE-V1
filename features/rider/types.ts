/**
 * Mirrors TMT-BE-V1's rider_profiles table (services/user-service/src/db/
 * schema.ts) and the rider-owned order-transition endpoints added to
 * order-service's routes/riderOrders.ts, plus rewards-service's new
 * per-delivery riderEarnings ledger. Built alongside the Rider app.
 */

export type VehicleType = "bicycle" | "motorcycle" | "car" | "van";
export type RiderVerificationStatus = "pending" | "verified" | "rejected";

export interface RiderProfile {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  plateNumber?: string | null;
  verificationStatus: RiderVerificationStatus;
  isOnline: boolean;
  rating: number;
  currentLat?: number | null;
  currentLng?: number | null;
}

export interface RiderEarningEntry {
  id: string;
  riderId: string;
  orderId: string;
  amount: string | number;
  createdAt: string;
}

export interface RiderEarningsSummary {
  totalEarnings: number;
  completedDeliveries: number;
}
