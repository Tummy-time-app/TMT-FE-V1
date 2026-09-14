import { mockDelay } from "@/lib/dev/devMode";
import type { CreatePromotionPayload, Promotion } from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * localStorage-backed, mirroring restaurant-service vendor.ts's actual
 * create logic (the 409-on-duplicate-name-per-restaurant check, `status`
 * always "active" on create) — same load/save-by-restaurantId pattern as
 * lib/mocks/vendorMenu.mock.ts's categories.
 * ═══════════════════════════════════════════════════════════════════════
 */

const PROMOTIONS_KEY = "tummytime_mock_promotions";

function load(): Record<string, Promotion[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PROMOTIONS_KEY) ?? "{}") as Record<string, Promotion[]>;
  } catch {
    return {};
  }
}

function save(data: Record<string, Promotion[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(data));
}

export async function mockGetPromotions(restaurantId: string): Promise<Promotion[]> {
  await mockDelay();
  return load()[restaurantId] ?? [];
}

export async function mockCreatePromotion(payload: CreatePromotionPayload): Promise<Promotion> {
  await mockDelay();
  const all = load();
  const existing = all[payload.restaurantId] ?? [];
  if (existing.some((p) => p.name.toLowerCase() === payload.name.toLowerCase())) {
    throw { status: 409, message: "A promotion with this name already exists for this restaurant" };
  }

  const promotion: Promotion = {
    id: crypto.randomUUID(),
    restaurantId: payload.restaurantId,
    name: payload.name,
    discountType: payload.discountType,
    discountAmount: payload.discountAmount,
    eligibleProductIds: payload.eligibleProductIds ?? null,
    startDate: payload.startDate,
    endDate: payload.endDate,
    minOrderAmount: payload.minOrderAmount ?? "0.00",
    maxRedemptions: payload.maxRedemptions ?? null,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  all[payload.restaurantId] = [...existing, promotion];
  save(all);
  return promotion;
}
