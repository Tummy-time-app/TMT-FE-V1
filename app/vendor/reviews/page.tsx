"use client";

import { useState } from "react";
import { StarSolid } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetTargetReviewsQuery, useRespondToReviewMutation } from "@/features/reviews/reviewsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import type { Review } from "@/features/reviews/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewRow({ review }: { review: Review }) {
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState("");
  const [respond, { isLoading }] = useRespondToReviewMutation();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!response.trim()) return;
    try {
      await respond({ id: review.id, response: response.trim() }).unwrap();
      toast.success("Reply posted.");
      setResponding(false);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-small font-semibold text-text">{review.reviewerName}</p>
          <p className="text-caption text-text-subtle">{formatDate(review.createdAt)}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-small font-semibold text-secondary">
          <StarSolid size={14} aria-hidden />
          {review.rating}/5
        </span>
      </div>
      {review.comment && <p className="mt-2 text-small text-text-muted">&ldquo;{review.comment}&rdquo;</p>}

      {review.vendorResponse ? (
        <div className="mt-3 rounded-md bg-black/[0.03] p-3 text-caption text-text-muted">
          <span className="font-semibold text-text">Your reply: </span>
          {review.vendorResponse}
        </div>
      ) : responding ? (
        <div className="mt-3">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-md bg-primary px-4 py-1.5 text-caption font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {isLoading ? "Posting…" : "Post reply"}
            </button>
            <button
              type="button"
              onClick={() => setResponding(false)}
              className="rounded-md border border-border px-4 py-1.5 text-caption font-semibold text-text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setResponding(true)}
          className="mt-2 text-caption font-semibold text-primary hover:underline"
        >
          Reply
        </button>
      )}
    </div>
  );
}

export default function VendorReviewsPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const { data: reviews, isLoading, error, refetch } = useGetTargetReviewsQuery(
    { targetType: "vendor", targetId: vendorId },
    { skip: !vendorId }
  );

  const avgRating = reviews && reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Reviews</h1>
      <p className="mt-1 text-small text-text-muted">
        {reviews && reviews.length > 0
          ? `${avgRating.toFixed(1)} average across ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
          : "What customers are saying about your store."}
      </p>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !reviews || reviews.length === 0 ? (
          <EmptyState icon={StarSolid} title="No reviews yet" description="Reviews from delivered orders will show up here." />
        ) : (
          reviews.map((review) => <ReviewRow key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
}
