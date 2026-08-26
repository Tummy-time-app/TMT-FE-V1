"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function RestaurantDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} message="We hit an unexpected error loading this restaurant." />;
}
