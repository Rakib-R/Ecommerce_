
'use client'

import React from 'react'
import axiosInstance from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import useUser from '../../hooks/useUser'; // Import the hook, not fetchUser
import ProductCard from '../../shared/components/product-card';

const Home = () => {
  const { user, isLoading: userLoading } = useUser();
  const isUser = !!user; // Convert to boolean

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-all-products?page=1&limit=10');
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2, 
  });

  const { data: latestProducts, isLoading: latestLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-all-products?page=1&limit=10&type=latest');
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  console.log("Products data:", products);
  
  if (userLoading) return <div>Loading...</div>; // Optional loading state
  
  return (
    <main>
      {isUser && (
        <section>
          <h2>Recommended for you</h2>
          {/* user-specific content */}
        </section>
      )}

      {/* ✅ Skeletons */ }
      <section className="">
        <h2 className="text-xl font-bold my-8">Products</h2>
        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {isLoading ? (
            // Show skeletons while loading
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[250px] bg-gray-300 animate-pulse rounded-xl" />
            ))
          ) : products && products.length > 0 ? (
            // Show products if they exist
            products.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={false} />
            ))
          ) : (
            // Show message if no products
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
    </section>
    
    {/* ✅ Actually use latestProducts */}
    <section className='gap-4'>
      <h2 className="text-xl font-bold my-8">Latest Products</h2>
      <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
        {latestLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[250px] bg-gray-300 animate-pulse rounded-xl" />
            ))
          : latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={false} />
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