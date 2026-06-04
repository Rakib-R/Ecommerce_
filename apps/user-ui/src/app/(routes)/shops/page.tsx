import React from 'react'
import Link from 'next/link'
import FilterSidebar from './filter' // We will create this next
import ShopCard from '../../shared/components/cards/shop-card'
import axiosInstance from '../../utils/axios'
import { shop } from '../../../types'

interface PageProps {
  searchParams: Promise<{
    page?: string;
    categories?: string;
    countries?: string;
  }>
}

// Direct data fetching on the server
async function getShops(queryString: string) {
  try {
    const res = await axiosInstance.get(`/product/api/get-filtered-shops?${queryString}&limit=12`);
    return {
      shops: res.data.shops as shop[],
      totalPages: res.data.pagination.totalPages as number
    };
  } catch (error) {
    console.error("Failed fetching shops on server:", error);
    return { shops: [], totalPages: 1 };
  }
}

const Page = async ({ searchParams }: PageProps) => {

  const params = await searchParams;
  const currentPage = Object.keys(params).length === 0 ? 1 : parseInt(params.page || '1', 10);
  
  // Reconstruct the exact query string for your backend API
  const apiQuery = new URLSearchParams();
  if (params.categories) apiQuery.set('categories', params.categories);
  if (params.countries) apiQuery.set('countries', params.countries);
  apiQuery.set('page', currentPage.toString());

  const { shops, totalPages } = await getShops(apiQuery.toString());

  return (
    <main className="bg-[#f5f5f5] min-h-screen pb-10">
      <div className="w-full ml-[7.5rem] mt-4">
        <div>
          <h1 className="font-medium text-4xl leading-[1.2] mb-[14px]">All Shops</h1>
          <div className="text-sm">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="inline-block p-[1.5px] mx-1 rounded-full">{'>'}</span>
            <span>All Shops</span>
          </div>
          
          <div className="w-full flex flex-col lg:flex-row gap-8 mt-6">
            {/* Pass current selections down to interactive sidebar client component */}
            <FilterSidebar 
              initialCategories={params.categories ? params.categories.split(',') : []}
              initialCountry={params.countries || ''}
            />

            {/* Shop Listings Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shops.length > 0 ? (
                  shops.map((shop) => (
                    <ShopCard key={shop.id} shop={shop} />
                  ))
                ) : (
                  <p>No Shops found</p>
                )}
              </div>

              {/* Server-Driven Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {/* Previous Button */}
                  <Link
                    href={`/shops?${new URLSearchParams({ ...params, page: Math.max(1, currentPage - 1).toString() })}`}
                    className={`px-3 py-1 rounded border text-sm bg-white ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
                  >
                    Previous
                  </Link>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const pageParams = new URLSearchParams({ ...params, page: pageNum.toString() });
                    return (
                      <Link
                        key={pageNum}
                        href={`/shops?${pageParams.toString()}`}
                        className={`px-3 py-1 rounded border text-sm ${
                          currentPage === pageNum 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}

                  {/* Next Button */}
                  <Link
                    href={`/shops?${new URLSearchParams({ ...params, page: Math.min(totalPages, currentPage + 1).toString() })}`}
                    className={`px-3 py-1 rounded border text-sm bg-white ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}>
                    Next
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Page;