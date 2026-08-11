export type DiscountType = "percentage" | "fixed";

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiresAt: string;
  usageLimit?: number;
  timesUsed: number;
  /** undefined = platform-wide; set = only applies to orders from that vendor. */
  vendorId?: string;
  active: boolean;
}

export interface CreatePromotionPayload {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiresAt: string;
  usageLimit?: number;
  /** Omitted (admin-created) = platform-wide; set (vendor-created) = only applies to that vendor. */
  vendorId?: string;
}

export interface ValidatePromoInput {
  code: string;
  vendorId?: string;
  subtotal: number;
}

export interface ValidatePromoResult {
  promotion: Promotion;
  discountAmount: number;
}
