
'use client'

import React from 'react'
import axiosInstance from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import useUser from '../../hooks/useUser'; // Import the hook, not fetchUser
import dynamic from 'next/dynamic';

const ProductCard = dynamic(() => import('../../shared/components/cards/product-card'), {
  loading: () => <div className="h-48 animate-pulse bg-gray-200" />,
  ssr: false, 
});

const ShopCard = dynamic(() => import('../../shared/components/cards/shop-card'), {
  loading: () => <div className="h-48 animate-pulse bg-gray-200" />,
  ssr: false, 
});


const Home = () => {
  const { user, isLoading: userLoading, isError: userError } = useUser();
  const isUser = !!user && !userError;

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-all-products?page=1&limit=10');
      return res.data.getproductsPipeline;
    },
    staleTime: 1000 * 60 * 2, 
  });

  const { data: latestProducts, isLoading: LatestLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-all-products?page=1&limit=10&type=latest');
      return res.data.top10Pipeline;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: Offers, isLoading: offerLoading } = useQuery({
    queryKey: ['filtered-offers'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-filtered-offers');
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });  
  
  const { data: topShops, isLoading: shopLoading } = useQuery({
    queryKey: ['top-shops'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-filtered-shops');
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  if (userLoading) return <div>Loading...</div>; // Optional loading state
  console.log('Shopping Data', topShops)
  console.log('Latest Data', latestProducts)

  return (
    <main className='ml-8'>
      {isUser && (
        <section className='mt-8'>
          <h2 className='text-2xl font-medium'>Recommended for you</h2>
          <hr className='mt-3 opacity-50'/>
          {/* user-specific content */}
        </section>
      )}

      {/*  Skeletons */ }
      <section className="">
        <h2 className="text-2xl font-medium mt-16">Products</h2>
          <hr className='mt-4 opacity-50 mb-8'/>

        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-7 gap-6">
            {isLoading ? (

            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[220px] bg-gray-300 animate-pulse rounded-xl" />
            ))
          ) : products && products.length > 0 ? (
            // Show products if they exist
            products.map((product: any) => (
              <ProductCard key={product.id || product._id} product={product} isEvent={false} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
    </section>
    
    {/* ---- Latest Products  */}

    <section className='gap-4'>
      <h2 className="text-2xl font-medium mt-16">Latest Products</h2>
      <hr className='mt-4 opacity-50 mb-8'/>

      <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-7 gap-6">
        {LatestLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[220px] bg-gray-300 animate-pulse rounded-xl" />
            ))
          : latestProducts?.map((product: any) => (
              <ProductCard key={product.id || product._id} product={product} isEvent={false} />
            ))
        }
      </div>
    </section>
  
    { /*  Offers */}
    <section className='gap-4'>
      <h2 className="text-2xl font-medium mt-16">Top Offers</h2>
      <hr className='mt-4 opacity-50 mb-8'/>

      <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-7 gap-6">
        {offerLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[220px] bg-gray-300 animate-pulse rounded-xl" />
            ))
          : Offers?.map((offer: any) => (
              <ProductCard key={offer.id || offer._id} product={offer}  />
            ))
        }
      </div>
    </section>

    { /*  TOP - Shops */}
    <section className='gap-4'>
      <h2 className="text-2xl font-medium mt-16">Top Shops</h2>
      <hr className='mt-4 opacity-50 mb-8'/>

      <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-7 gap-6">
        {shopLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[220px] bg-gray-300 animate-pulse rounded-xl" />
            ))
              : topShops?.map((shop: any) => (
              <ShopCard key={shop.id || shop._id} shop={shop} />
            ))
        }
      </div>
    </section>

      {isError && (
        <p className="text-center text-red-500">Failed to load products.</p>
      )}
    </main>
  )
}

export default Home