import { mockDelay } from "@/lib/dev/devMode";
import type { Review, ReviewsSummary } from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Unlike orders/menu/promotions, nothing in this app actually *creates* a
 * review — there's no customer-facing "leave a review" flow anywhere in
 * this codebase. So this mock lazily seeds a fixed set of sample reviews
 * per restaurantId on first read (persisted to localStorage from then on,
 * so a vendor's reply sticks across reloads) rather than starting empty.
 * ═══════════════════════════════════════════════════════════════════════
 */

const REVIEWS_KEY = "tummytime_mock_reviews";

const SAMPLE_COMMENTS: { ratingOverall: number; ratingFood: number; ratingPackaging: number; ratingPrep: number; comment: string; daysAgo: number }[] = [
  { ratingOverall: 5, ratingFood: 5, ratingPackaging: 5, ratingPrep: 4, comment: "Food arrived hot and tasted amazing — will order again!", daysAgo: 1 },
  { ratingOverall: 4, ratingFood: 4, ratingPackaging: 4, ratingPrep: 5, comment: "Really good, just wish the portion was a bit bigger.", daysAgo: 3 },
  { ratingOverall: 3, ratingFood: 3, ratingPackaging: 3, ratingPrep: 2, comment: "Order took longer than expected but the food was decent.", daysAgo: 6 },
  { ratingOverall: 5, ratingFood: 5, ratingPackaging: 4, ratingPrep: 5, comment: "Best jollof I've had delivered in a while. Packaging kept it warm too.", daysAgo: 9 },
  { ratingOverall: 4, ratingFood: 4, ratingPackaging: 5, ratingPrep: 4, comment: "Solid order overall, nicely packaged.", daysAgo: 14 },
];

function load(): Record<string, Review[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(REVIEWS_KEY) ?? "{}") as Record<string, Review[]>;
  } catch {
    return {};
  }
}

function save(data: Record<string, Review[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(data));
}

function seedReviews(restaurantId: string): Review[] {
  const now = Date.now();
  return SAMPLE_COMMENTS.map((sample) => ({
    id: crypto.randomUUID(),
    restaurantId,
    customerId: crypto.randomUUID(),
    orderId: crypto.randomUUID(),
    ratingOverall: sample.ratingOverall,
    ratingFood: sample.ratingFood,
    ratingPackaging: sample.ratingPackaging,
    ratingPrep: sample.ratingPrep,
    comment: sample.comment,
    vendorReply: null,
    createdAt: new Date(now - sample.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export async function mockGetReviews(restaurantId: string): Promise<ReviewsSummary> {
  await mockDelay();
  const all = load();
  let reviews = all[restaurantId];
  if (!reviews) {
    reviews = seedReviews(restaurantId);
    all[restaurantId] = reviews;
    save(all);
  }

  const overallRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.ratingOverall), 0) / reviews.length).toFixed(1)
    : "4.7";

  return { overallRating, totalReviews: reviews.length, reviews };
}

export async function mockReplyToReview(reviewId: string, vendorReply: string): Promise<Review> {
  await mockDelay();
  const all = load();
  for (const restaurantId of Object.keys(all)) {
    const idx = all[restaurantId].findIndex((r) => r.id === reviewId);
    if (idx !== -1) {
      all[restaurantId][idx] = { ...all[restaurantId][idx], vendorReply };
      save(all);
      return all[restaurantId][idx];
    }
  }
  throw { status: 404, message: "Review not found" };
}
