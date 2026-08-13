"use client";

import { StarSolid, EyeOff } from "@/components/icons";
import { useGetAllReviewsQuery, useModerateReviewMutation } from "@/features/reviews/reviewsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminReviewsPage() {
  const { data: reviews, isLoading, error, refetch } = useGetAllReviewsQuery();
  const [moderate] = useModerateReviewMutation();
  const toast = useToast();

  const handleToggleHidden = async (id: string, isHidden: boolean) => {
    try {
      await moderate({ id, isHidden: !isHidden }).unwrap();
      toast.success(!isHidden ? "Review hidden." : "Review restored.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Reviews</h1>
      <p className="mt-1 text-small text-text-muted">Every review on the platform — vendor and rider, including hidden ones.</p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !reviews || reviews.length === 0 ? (
          <EmptyState icon={StarSolid} title="No reviews yet" description="Reviews left on delivered orders will show up here." />
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "flex items-start gap-4 rounded-lg border bg-surface p-4",
                review.isHidden ? "border-error/30 opacity-60" : "border-border"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                <StarSolid size={16} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-text">
                  {review.reviewerName} rated a {review.targetType} {review.rating}/5
                </p>
                <p className="text-caption text-text-subtle">
                  {formatDate(review.createdAt)} · Order #{review.orderId} · Target: {review.targetId}
                </p>
                {review.comment && <p className="mt-1.5 text-small text-text-muted">&ldquo;{review.comment}&rdquo;</p>}
                {review.vendorResponse && (
                  <p className="mt-1.5 text-caption text-text-subtle">
                    <span className="font-semibold text-text">Vendor reply: </span>
                    {review.vendorResponse}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleToggleHidden(review.id, !!review.isHidden)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-caption font-semibold transition-colors",
                  review.isHidden
                    ? "border-success/30 text-success hover:bg-success-bg"
                    : "border-error/30 text-error hover:bg-error-bg"
                )}
              >
                <EyeOff size={13} aria-hidden />
                {review.isHidden ? "Restore" : "Hide"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
