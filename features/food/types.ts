import type { MenuItem, Restaurant } from "@/features/restaurants/types";

/** A menu item paired with the restaurant it belongs to — the shape a cross-restaurant discovery feed needs that a single restaurant's menu (features/restaurants/types.ts's plain MenuItem[]) doesn't carry. */
export interface FoodListing {
  item: MenuItem;
  restaurant: Restaurant;
}
