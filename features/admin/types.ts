/**
 * Mirrors TMT-BE-V1's admin-facing routes across three services:
 * user-service's adminRoutes.ts (users/riders), order-service's
 * adminOrders.ts, restaurant-service's adminRestaurants.ts, and
 * rewards-service's new adminRewards.ts. See the Admin dashboard
 * implementation plan for which blueprint modules this pass covers.
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  isEmailVerified?: boolean;
  createdAt?: string;
}

/** The joined shape adminRoutes.ts's GET /riders now returns — a riderProfiles row plus the owning user's name/email/phone. */
export interface AdminRider {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  plateNumber?: string | null;
  verificationStatus: "pending" | "verified" | "rejected";
  isOnline: boolean;
  rating: string | number;
  createdAt?: string;
}

export interface AdminRewardsSummary {
  totalCashbackIssued: number;
  totalWalletDeposits: number;
  totalWalletBalance: number;
  totalRiderEarningsPaid: number;
  loyaltyPointsOutstanding: number;
  freeDeliveriesEarned: number;
  freeDeliveriesUsed: number;
  freeDeliveriesExpired: number;
}
