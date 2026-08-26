"use client";

import type { IconComponent } from "@/components/icons";
import "./CategoryRail.css";

export interface CategoryRailItem {
  id: string;
  label: string;
  icon?: IconComponent;
}

/**
 * The horizontally-scrollable icon-chip rail used to pick a cuisine/
 * category — shared across restaurant listing, food discovery, shops, and
 * markets rather than each page rolling its own. Generalizes what was
 * already a real horizontal-scroll rail in RestaurantsList.tsx (`.vp-
 * categories`), just cuisine-only and icon-less there.
 */
export function CategoryRail({
  items,
  activeId,
  onSelect,
}: {
  items: CategoryRailItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="tmt-rail">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            className={`tmt-rail__item ${active ? "tmt-rail__item--active" : ""}`}
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
          >
            {Icon && <Icon className="tmt-rail__icon" aria-hidden />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
