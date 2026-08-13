import { StoreDetailClient } from "@/components/vendor/StoreDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ShopPage({ params }: Props) {
  const { id } = await params;
  return <StoreDetailClient id={id} />;
}
