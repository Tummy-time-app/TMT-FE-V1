import { mockDelay } from "@/lib/dev/devMode";
import type { CreatePromotionPayload, Promotion, ValidatePromoInput, ValidatePromoResult } from "@/features/promotions/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern. */

const PROMOTIONS_STORAGE_KEY = "tummytime_mock_promotions";

function farFutureDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

function seedPromotions(): Promotion[] {
  return [
    {
      id: "promo-tummy10",
      code: "TUMMY10",
      description: "10% off your order",
      discountType: "percentage",
      discountValue: 10,
      expiresAt: farFutureDate(),
      timesUsed: 0,
      active: true,
    },
    {
      id: "promo-welcome500",
      code: "WELCOME500",
      description: "₦500 off orders over ₦2,000",
      discountType: "fixed",
      discountValue: 500,
      minOrderAmount: 2000,
      expiresAt: farFutureDate(),
      timesUsed: 0,
      active: true,
    },
  ];
}

function loadPromotions(): Promotion[] {
  if (typeof window === "undefined") return seedPromotions();
  try {
    const raw = window.localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (!raw) {
      const seeded = seedPromotions();
      window.localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Promotion[];
  } catch {
    return seedPromotions();
  }
}

function savePromotions(promotions: Promotion[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(promotions));
}

/** Active, platform-wide + vendor-specific promos a customer can browse. */
export async function mockGetPromotions(): Promise<Promotion[]> {
  await mockDelay(350);
  const now = Date.now();
  return loadPromotions().filter((p) => p.active && new Date(p.expiresAt).getTime() > now);
}

/** A vendor's own promos (platform-wide ones aren't vendor-editable, so excluded here). */
export async function mockGetVendorPromotions(vendorId: string): Promise<Promotion[]> {
  await mockDelay(350);
  return loadPromotions().filter((p) => p.vendorId === vendorId);
}

/** Admin — every promotion on the platform, active or not. */
export async function mockGetAllPromotions(): Promise<Promotion[]> {
  await mockDelay(350);
  return [...loadPromotions()].sort((a, b) => b.expiresAt.localeCompare(a.expiresAt));
}

export async function mockValidatePromoCode({ code, vendorId, subtotal }: ValidatePromoInput): Promise<ValidatePromoResult> {
  await mockDelay(500);
  const promotions = loadPromotions();
  const idx = promotions.findIndex((p) => p.code.toLowerCase() === code.trim().toLowerCase());
  if (idx === -1) throw { status: 404, message: "That promo code doesn't exist." };

  const promo = promotions[idx];
  if (!promo.active) throw { status: 422, message: "This promo code is no longer active." };
  if (new Date(promo.expiresAt).getTime() < Date.now()) throw { status: 422, message: "This promo code has expired." };
  if (promo.usageLimit !== undefined && promo.timesUsed >= promo.usageLimit) {
    throw { status: 422, message: "This promo code has reached its usage limit." };
  }
  if (promo.vendorId && promo.vendorId !== vendorId) {
    throw { status: 422, message: "This promo code isn't valid for this vendor." };
  }
  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    throw { status: 422, message: `This code requires a minimum order of ₦${promo.minOrderAmount.toLocaleString("en-NG")}.` };
  }

  const discountAmount =
    promo.discountType === "percentage"
      ? Math.round((subtotal * promo.discountValue) / 100)
      : Math.min(promo.discountValue, subtotal);

  return { promotion: promo, discountAmount };
}

/** Called once an order using a promo is actually placed, to consume the usage. */
export async function mockRedeemPromoCode(code: string): Promise<void> {
  const promotions = loadPromotions();
  const idx = promotions.findIndex((p) => p.code.toLowerCase() === code.trim().toLowerCase());
  if (idx === -1) return;
  promotions[idx] = { ...promotions[idx], timesUsed: promotions[idx].timesUsed + 1 };
  savePromotions(promotions);
}

export async function mockCreatePromotion(payload: CreatePromotionPayload): Promise<Promotion> {
  await mockDelay(500);
  const promotions = loadPromotions();
  if (promotions.some((p) => p.code.toLowerCase() === payload.code.trim().toLowerCase())) {
    throw { status: 422, message: "A promo with this code already exists." };
  }
  const promo: Promotion = {
    id: `promo-${Date.now().toString(36)}`,
    code: payload.code.trim().toUpperCase(),
    description: payload.description,
    discountType: payload.discountType,
    discountValue: payload.discountValue,
    minOrderAmount: payload.minOrderAmount,
    expiresAt: payload.expiresAt,
    usageLimit: payload.usageLimit,
    timesUsed: 0,
    vendorId: payload.vendorId,
    active: true,
  };
  savePromotions([promo, ...promotions]);
  return promo;
}

export async function mockUpdatePromotion(id: string, patch: Partial<CreatePromotionPayload & { active: boolean }>): Promise<Promotion> {
  await mockDelay(400);
  const promotions = loadPromotions();
  const idx = promotions.findIndex((p) => p.id === id);
  if (idx === -1) throw { status: 404, message: "Promo not found." };
  promotions[idx] = { ...promotions[idx], ...patch };
  savePromotions(promotions);
  return promotions[idx];
}

export async function mockDeletePromotion(id: string): Promise<{ id: string }> {
  await mockDelay(400);
  savePromotions(loadPromotions().filter((p) => p.id !== id));
  return { id };
}
