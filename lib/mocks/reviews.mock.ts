import { mockDelay } from "@/lib/dev/devMode";
import { mockGetOrder } from "@/lib/mocks/orders.mock";
import { findVendorOwnerId } from "@/lib/mocks/auth.mock";
import { pushNotificationInternal } from "@/lib/mocks/notifications.mock";
import type {
  CreateReviewPayload,
  ModerateReviewPayload,
  RespondToReviewPayload,
  Review,
  ReviewTargetType,
} from "@/features/reviews/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern this follows. */

const REVIEWS_STORAGE_KEY = "tummytime_mock_reviews";

function loadReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(REVIEWS_STORAGE_KEY) ?? "[]") as Review[];
  } catch {
    return [];
  }
}

function saveReviews(reviews: Review[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

/** Reviews for one target (a vendor's storefront, or a rider's profile), visible to customers — hidden ones excluded. */
export async function mockGetTargetReviews(targetType: ReviewTargetType, targetId: string): Promise<Review[]> {
  await mockDelay(300);
  return loadReviews()
    .filter((r) => r.targetType === targetType && r.targetId === targetId && !r.isHidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** The reviews (vendor and/or rider) already left for one order — used to gate "Rate this order" UI so it can't double-submit. */
export async function mockGetOrderReviews(orderId: string): Promise<Review[]> {
  await mockDelay(200);
  return loadReviews().filter((r) => r.orderId === orderId);
}

/** Derives a live `{ rating, reviewCount }` from real review data for a vendor — falls back to the caller's static seed numbers when there are no reviews yet, so unreviewed vendors don't suddenly show "0.0 (0)". */
export function deriveVendorRatingInternal(vendorId: string, fallback: { rating: number; reviewCount: number }) {
  const vendorReviews = loadReviews().filter((r) => r.targetType === "vendor" && r.targetId === vendorId && !r.isHidden);
  if (vendorReviews.length === 0) return fallback;
  const avg = vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length;
  return { rating: Math.round(avg * 10) / 10, reviewCount: vendorReviews.length };
}

export async function mockCreateReview(payload: CreateReviewPayload): Promise<Review> {
  await mockDelay(500);

  const order = await mockGetOrder(payload.orderId).catch(() => null);
  if (!order) throw { status: 404, message: "We couldn't find that order." };
  if (order.customerId !== payload.reviewerId) {
    throw { status: 403, message: "You can only review your own orders." };
  }
  if (order.status !== "delivered") {
    throw { status: 422, message: "You can only review an order after it's delivered." };
  }
  if (payload.rating < 1 || payload.rating > 5) {
    throw { status: 422, message: "Rating must be between 1 and 5." };
  }

  const existing = loadReviews();
  if (existing.some((r) => r.orderId === payload.orderId && r.targetType === payload.targetType)) {
    throw { status: 422, message: "You've already reviewed this." };
  }

  const review: Review = {
    id: `review-${Date.now().toString(36)}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  saveReviews([review, ...existing]);

  if (payload.targetType === "vendor") {
    const ownerId = findVendorOwnerId(payload.targetId);
    if (ownerId) {
      pushNotificationInternal(ownerId, {
        type: "system",
        title: "New review",
        message: `${payload.reviewerName} left a ${payload.rating}-star review.`,
        link: "/vendor/reviews",
      });
    }
  }

  return review;
}

/** Vendor replying to a review left on their store. */
export async function mockRespondToReview({ id, response }: RespondToReviewPayload): Promise<Review> {
  await mockDelay(400);
  const reviews = loadReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) throw { status: 404, message: "Review not found." };
  reviews[idx] = { ...reviews[idx], vendorResponse: response };
  saveReviews(reviews);
  return reviews[idx];
}

/** Admin — every review on the platform, including hidden ones. */
export async function mockGetAllReviews(): Promise<Review[]> {
  await mockDelay(350);
  return [...loadReviews()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Admin moderation — hide/unhide a review without deleting it. */
export async function mockModerateReview({ id, isHidden }: ModerateReviewPayload): Promise<Review> {
  await mockDelay(400);
  const reviews = loadReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) throw { status: 404, message: "Review not found." };
  reviews[idx] = { ...reviews[idx], isHidden };
  saveReviews(reviews);
  return reviews[idx];
}
