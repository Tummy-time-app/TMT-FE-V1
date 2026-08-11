import type { LatLng } from "@/lib/maps/types";
import type { IconComponent } from "@/components/icons";

export type VendorApprovalStatus = "pending" | "approved" | "suspended";

export type Vendor = {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  priceRange: 1 | 2 | 3;
  isOpen: boolean;
  isNew: boolean;
  isFeatured: boolean;
  promoLabel?: string;
  location: LatLng;
  approvalStatus: VendorApprovalStatus;
};

export type VendorCategory = {
  id: string;
  label: string;
  icon: IconComponent;
  gradient: string;
};

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  available: boolean;
}

export interface VendorSummary {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address?: string;
  isOpen: boolean;
  openHours?: string;
  image: string;
  logo: string;
  tags: string[];
  categories: string[];
  location: LatLng;
  approvalStatus: VendorApprovalStatus;
}

export interface VendorDetail {
  restaurant: VendorSummary;
  menuItems: MenuItem[];
}

export type VendorSortKey = "recommended" | "rating" | "delivery_time" | "delivery_fee";

export interface VendorQueryParams {
  category?: string;
  search?: string;
  sort?: VendorSortKey;
  freeDelivery?: boolean;
  openNow?: boolean;
  /** Only include vendors whose max ETA is at or under this many minutes. */
  maxDeliveryTime?: number;
  page?: number;
  pageSize?: number;
}

export interface VendorsResponse {
  /** Always returned in full — never paginated. */
  featured: Vendor[];
  /** Paginated (accumulates as `page` grows, matching the "View more" pattern). */
  vendors: Vendor[];
  /** Total non-featured vendors matching the query, for the "N restaurants" count + hasMore. */
  total: number;
}
