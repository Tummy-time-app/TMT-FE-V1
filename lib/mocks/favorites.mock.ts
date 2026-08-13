import { mockDelay } from "@/lib/dev/devMode";
import type { Favorite } from "@/features/favorites/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern this follows. */

const FAVORITES_STORAGE_KEY = "tummytime_mock_favorites";

function loadFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]") as Favorite[];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Favorite[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

export async function mockGetFavorites(userId: string): Promise<Favorite[]> {
  await mockDelay(300);
  return loadFavorites()
    .filter((f) => f.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mockAddFavorite(userId: string, vendorId: string): Promise<Favorite> {
  await mockDelay(300);
  const existing = loadFavorites();
  const already = existing.find((f) => f.userId === userId && f.vendorId === vendorId);
  if (already) return already;

  const favorite: Favorite = { id: `fav-${Date.now().toString(36)}`, userId, vendorId, createdAt: new Date().toISOString() };
  saveFavorites([favorite, ...existing]);
  return favorite;
}

export async function mockRemoveFavorite(userId: string, vendorId: string): Promise<{ vendorId: string }> {
  await mockDelay(300);
  saveFavorites(loadFavorites().filter((f) => !(f.userId === userId && f.vendorId === vendorId)));
  return { vendorId };
}
