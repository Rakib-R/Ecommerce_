


import ProductCard from "@user-ui/app/shared/components/cards/product-card";
import { ProductPayload } from "@user-ui/types";

export const OfferSection = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-filtered-offers`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Response status:', res.status, res.statusText);
    return <div className="font-sans text-2xl tracking-widest">Failed to load offers</div>;
  }
    
  const data = await res.json();
  const offer = data.products;

  return (
    <div className="m-auto grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-6">
      {offer.map((offer: ProductPayload) => (
        <ProductCard
          key={`${String(offer.id)}-offer`}
          product={offer}
          isEvent={true}
        />
      ))}
    </div>
  );
};