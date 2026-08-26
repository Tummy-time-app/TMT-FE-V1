import "./DummyStrip.css";

/**
 * Overlaid on any card rendering placeholder data (lib/dummy/*.dummy.ts)
 * — a diagonal hazard-stripe pattern plus explicit text, deliberately
 * unlike this app's other card badges ("New", a promo label) so it can
 * never be mistaken for one. Meant to stay legible even if a card is
 * screenshotted or viewed out of the page context the banner-level
 * DummyBanner provides.
 */
export function DummyStrip() {
  return (
    <div className="tmt-dummy-strip" role="note">
      Sample · Not from server
    </div>
  );
}
