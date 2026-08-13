import { mockDelay } from "@/lib/dev/devMode";
import type { Banner, CreateBannerPayload, UpdateBannerPayload } from "@/features/banners/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern this follows. */

const BANNERS_STORAGE_KEY = "tummytime_mock_banners";

function farFutureDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

function seedBanners(): Banner[] {
  const now = new Date().toISOString();
  return [
    {
      id: "banner-launch",
      title: "20% off your first 3 orders",
      imageUrl: "/images/jollof-spaghetti.jpg",
      linkUrl: "/promotions",
      placement: "home",
      isActive: true,
      startsAt: now,
      endsAt: farFutureDate(),
      createdAt: now,
    },
  ];
}

function loadBanners(): Banner[] {
  if (typeof window === "undefined") return seedBanners();
  try {
    const raw = window.localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) {
      const seeded = seedBanners();
      window.localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Banner[];
  } catch {
    return seedBanners();
  }
}

function saveBanners(banners: Banner[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
}

/** Customer-facing — active banners for one placement, within their scheduled window. */
export async function mockGetActiveBanners(placement: string): Promise<Banner[]> {
  await mockDelay(250);
  const now = Date.now();
  return loadBanners().filter(
    (b) =>
      b.placement === placement &&
      b.isActive &&
      new Date(b.startsAt).getTime() <= now &&
      new Date(b.endsAt).getTime() >= now
  );
}

/** Admin — every banner regardless of schedule/active state. */
export async function mockGetAllBanners(): Promise<Banner[]> {
  await mockDelay(350);
  return [...loadBanners()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mockCreateBanner(payload: CreateBannerPayload): Promise<Banner> {
  await mockDelay(500);
  const banner: Banner = { id: `banner-${Date.now().toString(36)}`, ...payload, createdAt: new Date().toISOString() };
  saveBanners([banner, ...loadBanners()]);
  return banner;
}

export async function mockUpdateBanner(payload: UpdateBannerPayload): Promise<Banner> {
  await mockDelay(400);
  const banners = loadBanners();
  const idx = banners.findIndex((b) => b.id === payload.id);
  if (idx === -1) throw { status: 404, message: "Banner not found." };
  banners[idx] = { ...banners[idx], ...payload };
  saveBanners(banners);
  return banners[idx];
}

export async function mockDeleteBanner(id: string): Promise<{ id: string }> {
  await mockDelay(400);
  saveBanners(loadBanners().filter((b) => b.id !== id));
  return { id };
}
