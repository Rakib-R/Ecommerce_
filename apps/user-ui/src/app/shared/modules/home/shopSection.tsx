


import ShopCard from "@user-ui/shared/components/cards/shop-card";

export const ShopSection = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/top-shop?page=1&limit=10`, {
    cache: 'no-store',
  });

  const data = await res.json();
  const shops = data.shops;

  return (
    <div className="m-auto grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-6">
      {shops.map((shops: any) => (
        <ShopCard
          key={`${shops._id}-shops`}
          shop={shops}
        />
      ))}
    </div>
  );
};