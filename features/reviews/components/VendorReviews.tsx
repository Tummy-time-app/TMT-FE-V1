"use client";

import { StarSolid } from "@/components/icons";
import { useGetTargetReviewsQuery } from "@/features/reviews/reviewsApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

/** Read-only recent-reviews list for a vendor's public storefront page. Renders nothing while empty — no "0 reviews" noise on a fresh listing. */
export function VendorReviews({ vendorId }: { vendorId: string }) {
  const { data: reviews } = useGetTargetReviewsQuery({ targetType: "vendor", targetId: vendorId }, { skip: !vendorId });

  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mt-1 space-y-2.5">
      <p className="text-small font-bold text-text">Reviews ({reviews.length})</p>
      {reviews.slice(0, 4).map((review) => (
        <div key={review.id} className="rounded-lg border border-black/[0.06] bg-black/[0.015] p-3">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold text-text">{review.reviewerName}</span>
            <span className="flex items-center gap-0.5 text-caption font-semibold text-secondary">
              <StarSolid size={11} aria-hidden />
              {review.rating}
            </span>
          </div>
          {review.comment && <p className="mt-1 text-caption text-text-subtle">&ldquo;{review.comment}&rdquo;</p>}
          <p className="mt-1 text-[0.68rem] text-text-subtle/70">{formatDate(review.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
