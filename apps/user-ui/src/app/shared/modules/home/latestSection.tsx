

import ProductCard from "@user-ui/app/shared/components/cards/product-card";
import { ProductPayload } from "../../../../types";


export const LatestSection = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-all-products?page=1&limit=10&type=latest`, {
    cache: 'no-store',
  });

  const data = await res.json();
  const latest = data.top10Pipeline;

  return (
    <div className="grid ...">
      {latest.map((product: ProductPayload) => (
        <ProductCard key={`${product._id}-latest`} product={product} />
      ))}
    </div>
  );
};