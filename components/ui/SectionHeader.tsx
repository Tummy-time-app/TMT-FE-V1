import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import "./SectionHeader.css";

/** Title + optional subtitle + optional "See all" — every discovery-rail section (restaurant listing's cuisine groups, food discovery's rails, etc.) shares this instead of a bespoke `<h2>` each time. */
export function SectionHeader({
  title,
  subtitle,
  seeAllHref,
}: {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
}) {
  return (
    <div className="tmt-section-header">
      <div>
        <h2 className="tmt-section-header__title">{title}</h2>
        {subtitle && <p className="tmt-section-header__subtitle">{subtitle}</p>}
      </div>
      {seeAllHref && (
        <Link href={seeAllHref} className="tmt-section-header__see-all">
          See all
          <ChevronRightIcon width={14} height={14} />
        </Link>
      )}
    </div>
  );
}
