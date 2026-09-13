import Link from "next/link";
import type { IconComponent } from "@/components/icons";
import { Navigation } from "@/components/nav/Navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import "./ComingSoon.css";

/**
 * Shared placeholder for menu destinations the product/UX blueprint calls
 * for (side-drawer "Marketplace"/"Rewards"/"Account" sections) that don't
 * have a real feature behind them yet — keeps every nav link pointing
 * somewhere real instead of 404ing, without faking functionality. Swap a
 * page over to its own view once the feature actually exists.
 */
export function ComingSoonPage({
  icon,
  title,
  message = "We're still building this out — check back soon.",
}: {
  icon: IconComponent;
  title: string;
  message?: string;
}) {
  return (
    <>
      <Navigation />
      <div className="tmt-coming-soon">
        <EmptyState
          icon={icon}
          title={title}
          message={message}
          action={
            <Link href="/" className="tmt-coming-soon__link">
              Back to home
            </Link>
          }
        />
      </div>
    </>
  );
}
