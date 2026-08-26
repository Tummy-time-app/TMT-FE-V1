"use client";

import { useEffect } from "react";
import { Navigation } from "@/components/nav/Navigation";
import { AlertTriangleIcon } from "@/components/icons";
import "./RouteError.css";

/**
 * Shared body for every route-level app/**\/error.tsx boundary — Next
 * requires each one to be its own file/default-export, but the actual UI
 * (and the "log it, then offer a reset" behavior) only needs to exist
 * once. Renders its own <Navigation/> since error.tsx replaces
 * page.tsx's entire tree, including wherever that page would have
 * rendered the header itself — the root layout's providers (auth/cart/
 * profile/store) stay mounted regardless, since error boundaries only
 * replace the segment below the nearest layout.
 */
export function RouteError({
  error,
  reset,
  title = "Something went wrong",
  message = "We hit an unexpected error loading this page.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
}) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <>
      <Navigation />
      <div className="route-error">
        <div className="route-error__icon" aria-hidden>
          <AlertTriangleIcon />
        </div>
        <p className="route-error__title">{title}</p>
        <p className="route-error__sub">{message}</p>
        <button type="button" className="route-error__cta" onClick={reset}>
          Try again
        </button>
      </div>
    </>
  );
}
