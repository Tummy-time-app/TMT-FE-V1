/** Maps to the `cms_banners` table (doc §4 "Admin/audit"). */
export type BannerPlacement = "home" | "checkout" | "search";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: BannerPlacement;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export type CreateBannerPayload = Omit<Banner, "id" | "createdAt">;
export type UpdateBannerPayload = Partial<CreateBannerPayload> & { id: string };
