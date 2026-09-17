import { redirect } from "next/navigation";

/**
 * Shops are just businessType-filtered `restaurants` rows now (see the
 * marketplace-expansion plan's Phase C) — every shop card links straight to
 * the real restaurant detail route. Kept only as a redirect so an old
 * `/vendors/shops/:id` link still lands somewhere, mirroring app/riders/
 * page.tsx's precedent.
 */
export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/vendors/restaurants/${id}`);
}
