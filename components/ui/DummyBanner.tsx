import { AlertTriangleIcon } from "@/components/icons";
import "./DummyBanner.css";

/**
 * Page-level companion to DummyStrip (card-level) — shown once above a
 * section that's entirely placeholder data because the real query came
 * back empty (not erroring — see each list/detail component's isDummy
 * check, gated on isSuccess/!isError, not isLoading/isError).
 */
export function DummyBanner({
  message = "No live listings yet — showing sample data so you can see how this page works.",
}: {
  message?: string;
}) {
  return (
    <div className="tmt-dummy-banner" role="status">
      <AlertTriangleIcon width={16} height={16} />
      <span>{message}</span>
    </div>
  );
}
