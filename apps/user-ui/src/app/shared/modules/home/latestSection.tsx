

import ProductCard from "../../../shared/components/cards/product-card";
import { ProductPayloadWithDetails } from "../../../../types";


export const LatestSection = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-all-products?page=1&limit=10&type=latest`, {
    cache: 'no-store',
  });

    if (!res.ok) {
    console.error('Response status:', res.status, res.statusText);
    return <div className="font-sans text-2xl tracking-widest">Failed to load products</div>;
  }


  const data = await res.json();
  const latest = data.top10Pipeline;
  console.log('Latest Product _id value:', latest[0]?.id, typeof latest[0]?.id)

  return (
    <div className="m-auto grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
      {latest.map((latest: ProductPayloadWithDetails) => (
        <ProductCard key={`${String(latest.id)}-latest`} product={latest} />
      ))}
    </div>
  );
};