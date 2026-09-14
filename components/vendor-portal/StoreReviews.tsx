"use client";

import { useState } from "react";
import { useGetReviewsQuery, useReplyToReviewMutation } from "@/features/vendor/reviewsApi";
import type { Review } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewCard({ review, restaurantId }: { review: Review; restaurantId: string }) {
  const [replyToReview, { isLoading }] = useReplyToReviewMutation();
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleReply = async () => {
    setError(null);
    try {
      await replyToReview({ reviewId: review.id, restaurantId, vendorReply: text }).unwrap();
      setReplying(false);
      setText("");
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="vd-form-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <p className="vd-form-card__title" style={{ marginBottom: 2 }}>Order #{review.orderId.slice(0, 8)}</p>
          <p className="vd-form-card__sub" style={{ marginBottom: 0 }}>{formatDate(review.createdAt)}</p>
        </div>
        <span className="op-badge op-badge--active">★ {review.ratingOverall}</span>
      </div>

      <p className="vd-subtitle" style={{ marginTop: 8 }}>
        Food {review.ratingFood ?? "—"} · Packaging {review.ratingPackaging ?? "—"} · Prep time {review.ratingPrep ?? "—"}
      </p>

      {review.comment && <p style={{ fontSize: "0.88rem", color: "var(--text-dark)", marginTop: 4 }}>{review.comment}</p>}

      {review.vendorReply ? (
        <div className="vd-inline-panel">
          <p className="vd-subtitle" style={{ marginTop: 0, marginBottom: 4 }}>Your reply</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-dark)" }}>{review.vendorReply}</p>
        </div>
      ) : replying ? (
        <div className="vd-inline-panel">
          <div className="vd-field">
            <label htmlFor={`reply-${review.id}`}>Your reply</label>
            <textarea
              id={`reply-${review.id}`}
              className="vd-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Thank the customer or address their feedback…"
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="vd-submit-btn"
              style={{ marginTop: 0, width: "auto", padding: "10px 18px" }}
              disabled={isLoading || !text.trim()}
              onClick={handleReply}
            >
              {isLoading ? "Posting…" : "Confirm reply"}
            </button>
            <button type="button" className="vd-back-link" style={{ marginBottom: 0 }} onClick={() => setReplying(false)}>
              Cancel
            </button>
          </div>
          {error && <p className="vd-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
        </div>
      ) : (
        <button
          type="button"
          className="vd-back-link"
          style={{ marginTop: 10, marginBottom: 0 }}
          onClick={() => setReplying(true)}
        >
          Reply
        </button>
      )}
    </div>
  );
}

/** Rendered inside VendorStoreShell, which already guarantees a signed-in vendor before mounting this. */
export function StoreReviews({ storeId }: { storeId: string }) {
  const { data, isLoading, isError } = useGetReviewsQuery(storeId);

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Reviews</h1>
        <p className="vd-subtitle">
          {isLoading || !data ? "Loading…" : `★ ${data.overallRating} average · ${data.totalReviews} review${data.totalReviews !== 1 ? "s" : ""}`}
        </p>
      </header>

      {isLoading ? (
        <p className="vp-empty">Loading reviews…</p>
      ) : isError || !data ? (
        <div className="vp-empty">
          <p className="vp-empty-title">Couldn&apos;t load reviews</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : data.reviews.length === 0 ? (
        <p className="vp-empty">No reviews yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} restaurantId={storeId} />
          ))}
        </div>
      )}
    </>
  );
}
