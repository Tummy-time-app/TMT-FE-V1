import { RestaurantClient } from './RestaurantClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  return <RestaurantClient id={id} />;
}
