
import ProductCard from "@user-ui/app/shared/components/cards/product-card";
import { ProductPayload } from "../../../../types";

export const ProductsSection = async () => {
   const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-all-products?page=1&limit=10&type=latest`, {
    cache: 'no-store',
  });
  const data = await res.json();
  const products = data.getproductsPipeline;

  return (
    <div className="m-auto grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-6">
      {products.map((product: ProductPayload) => (
        <ProductCard
          key={`${product._id}-product`}
          product={product}
          isEvent={false}
        />
      ))}
    </div>
  );
};