

  import ProductCard from "../../../shared/components/cards/product-card";
  import {  ProductPayloadWithDetails } from "../../../../types";


  export const ProductSection = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-all-products?page=1&limit=10&`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Response status:', res.status, res.statusText);
      return <div className="font-sans text-2xl tracking-widest">Failed to load products</div>;
    }
      
    // const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-all-products?page=1&limit=10&`);
    // const data = res.data


    const data = await res.json();
    const product = data.getproductsPipeline;

    const ids = product.map((p: ProductPayloadWithDetails) => String(p.id));
    // const hasDupes = ids.length !== new Set(ids).size;
    // console.log('Products IDs:', ids, 'Product | Has duplicates:', hasDupes);

    return (
      <div className="m-auto grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
        {product.map((product: ProductPayloadWithDetails) => (
          <ProductCard key={`${String(product.id)}-product`} product={product} />
        ))}
      </div>
    );
  };