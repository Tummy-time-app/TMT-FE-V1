/** Maps to the `categories` table (doc §4 "Vendors & catalog") — a vendor's own menu section names, distinct from `Products` CRUD. */
export interface ProductCategory {
  id: string;
  vendorId: string;
  name: string;
  sortOrder: number;
}

export type CreateCategoryPayload = { vendorId: string; name: string };
export type UpdateCategoryPayload = { id: string; vendorId: string; name?: string; sortOrder?: number };
