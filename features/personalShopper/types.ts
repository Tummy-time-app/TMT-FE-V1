/**
 * Mirrors TMT-BE-V1's order-service shopperRequests table (services/
 * order-service/src/db/schema.ts) — the blueprint §40-42 Personal Shopper
 * domain. No real shopper workforce/app exists: `assignedShopperName` is
 * free text set by an admin action (see features/admin/adminShopperRequestsApi.ts),
 * the same "manual stand-in" pattern as the rider app's verification gate.
 */
export type ShopperRequestStatus = "submitted" | "assigned" | "shopping" | "completed" | "cancelled";

export interface ShopperRequest {
  id: string;
  customerId: string;
  itemName: string;
  quantity: number;
  preferredBrand?: string | null;
  budget?: string | number | null;
  preferredStore?: string | null;
  deliveryAddress: string;
  /** Client-side data-URL string, same pattern as ProfileView.tsx's avatar — no file-upload/storage backend exists. */
  photoDataUrl?: string | null;
  status: ShopperRequestStatus;
  assignedShopperName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShopperRequestPayload {
  customerId: string;
  itemName: string;
  quantity: number;
  preferredBrand?: string;
  budget?: number;
  preferredStore?: string;
  deliveryAddress: string;
  photoDataUrl?: string;
}
