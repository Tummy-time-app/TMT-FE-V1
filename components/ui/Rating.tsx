import { StarIcon } from "@/components/icons";
import "./Rating.css";

/** Replaces the inline `StarRating` duplicated in RestaurantCard.tsx and the plain `★` text char used on the detail page — renders nothing below a real rating, same as both of those did (never show "0.0" for an un-rated restaurant). */
export function Rating({
  value,
  count,
  size = "md",
}: {
  value: number | null | undefined;
  count?: number | null;
  size?: "sm" | "md";
}) {
  if (value == null || value <= 0) return null;
  return (
    <span className={`tmt-rating tmt-rating--${size}`}>
      <StarIcon className="tmt-rating__star" aria-hidden />
      <span className="tmt-rating__value">{value.toFixed(1)}</span>
      {count != null && count > 0 && <span className="tmt-rating__count">({count})</span>}
    </span>
  );
}
