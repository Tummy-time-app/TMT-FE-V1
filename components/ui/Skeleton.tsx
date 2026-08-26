import type { CSSProperties } from "react";
import "./Skeleton.css";

/** Generalizes the shimmer block previously duplicated per-page as `.vc-skel` — any card/row skeleton across the marketplace should use this instead of a new copy. */
export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`tmt-skel ${className}`} style={style} aria-hidden />;
}
