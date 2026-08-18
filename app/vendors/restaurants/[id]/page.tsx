import { notFound } from 'next/navigation';
// import { getRestaurantData, type RestaurantData, type CartEntry, type MenuItem } from '@/lib/restaurantData';
import { RestaurantClient } from './RestaurantClient';
import { getRestaurantData } from '@/lib/restaurantData';

interface Props {
  params: { id: string };
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const data = getRestaurantData(id);
  if (!data) notFound();

  return <RestaurantClient data={data} />;
}

