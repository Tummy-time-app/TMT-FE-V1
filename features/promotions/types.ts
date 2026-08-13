export type DiscountType = "percentage" | "fixed";

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  /** Maps to `promo_codes.max_discount` — caps a percentage discount's naira value; unset for fixed-amount promos. */
  maxDiscount?: number;
  /** Maps to `promo_codes.valid_from`. Currently always the promo's `createdAt` in dev mode — no scheduled-future-start UI exists yet. */
  validFrom?: string;
  expiresAt: string;
  usageLimit?: number;
  /** Maps to `promo_codes.per_user_limit` — how many times one customer can redeem this code (separate from the platform-wide `usageLimit`). */
  perUserLimit?: number;
  timesUsed: number;
  /**
   * Maps to `promo_codes.applicable_vendor_ids` (a jsonb array in the real
   * schema — one promo can span several vendors). This codebase's
   * creation UI only ever produces zero or one vendor (a vendor scopes a
   * promo to their own store; admin leaves it platform-wide), so treat
   * `undefined`/`[]` as platform-wide and a populated array as "applies to
   * these vendors" — never assume it's exactly one entry.
   */
  applicableVendorIds?: string[];
  active: boolean;
}

export interface CreatePromotionPayload {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  perUserLimit?: number;
  /** Omitted/empty (admin-created) = platform-wide; one entry (vendor-created) = only applies to that vendor. */
  applicableVendorIds?: string[];
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
