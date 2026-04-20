


import ShopCard from "@user-ui/app/shared/components/cards/shop-card";
import { ShopType } from "@apps/user-ui/src/types";

type Shop = ShopType['shop'];

export const ShopSection = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-filtered-shops?page=1&limit=10`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Response status:', res.status, res.statusText);
    return <div className="font-sans text-2xl tracking-widest">Failed to load shops</div>;
  }
    
  const data = await res.json();
  
  console.log('RAW DATA:', data); // log the full response first
const shops = data.shops ?? [];

  return (
    <div className="m-auto grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-6">
      {shops.map((shops: Shop) => (
        <ShopCard
          key={`${String(shops.id)}-shops`}
          shop={shops}
        />
      ))}
    </div>
  );
};