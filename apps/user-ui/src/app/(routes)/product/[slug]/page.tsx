
import { Metadata } from 'next';
import React from 'react'
import ProductDetails from '@user-ui/shared/modules/product/productDetails';
import ProductDetails_experimental from 'src/app/shared/modules/product/ProductDetailsCard_experimental';
import axiosInstance from 'src/app/utils/axios';

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`/product/api/get-product/${slug}`);
  return response.data.product;
}

export async function generateMetadata({
  params}: { params: Promise<{ slug: string }>;  
}): Promise<Metadata> {

  const { slug } = await params; 
  const product = await fetchProductDetails(slug);

  return {
    title: `${product?.title} | Marketplace` ,

    openGraph: {
    description: product?.short_description || "Discover high-quality products on Becodemy Marketplace.",
    images: [product?.images?.[0]?.url || "/default-image.jpg"],
    type: "website",
    },
    
    twitter: {
        card: "summary_large_image",
        title: product?.title,
        description: product?.short_description || "Discover high-quality products on Becodemy Marketplace.",
        images: [product?.images?.[0]?.url || "/default-image.jpg"],
        },
    }
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params; 
  const productDetails = await fetchProductDetails(slug);

  return (
  <main className=''>
      <ProductDetails_experimental data={productDetails}/>
  </main>)
};

export default Page;