/**
 * Mirrors TMT-BE-V1's restaurant-service exactly — see
 * services/restaurant-service/src/db/schema.ts and
 * shared/src/types.ts's RestaurantDTO/MenuItemDTO (the backend's own
 * declared public contract). The DB row has many more vendor-management
 * columns (verificationStatus, openingHours, averagePrepTime, ...) — not
 * modeled here since there's no vendor dashboard UI to use them yet.
 */
export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  phone?: string | null;
  cuisine?: string | null;
  rating?: string | number | null;
  imageUrl?: string | null;
  isOpen: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  price: string | number;
  category?: string;
  imageUrl?: string | null;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}
