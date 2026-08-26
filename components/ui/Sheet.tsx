"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import "./Sheet.css";

/**
 * One overlay primitive that's a right-side drawer at desktop widths and a
 * bottom sheet at mobile widths — decided purely by CSS media query (see
 * Sheet.css), not JS viewport detection, so there's no client/server
 * hydration mismatch. Backs the filter UI, the cart drawer, and the item
 * detail panel, replacing three near-identical hand-rolled overlays.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`tmt-sheet-backdrop ${open ? "tmt-sheet-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`tmt-sheet ${open ? "tmt-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
      >
        <div className="tmt-sheet__handle" aria-hidden />
        <div className="tmt-sheet__header">
          <h2 className="tmt-sheet__title">{title}</h2>
          <button type="button" className="tmt-sheet__close" onClick={onClose} aria-label="Close">
            <CloseIcon width={16} height={16} />
          </button>
        </div>
        <div className="tmt-sheet__body">{children}</div>
        {footer && <div className="tmt-sheet__footer">{footer}</div>}
      </aside>
    </>
  );
}
