
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from 'src/app/utils/axios'
import Link from 'next/link'
import { categories } from 'src/app/configs/categories'
import ShopCard from 'src/app/shared/components/cards/shop-card'
import {countries} from '../../configs/countries'

const Page = () => {
  const router = useRouter();

  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string>('');
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const URLSearch = new URLSearchParams(window.location.search);

    // Read page from URL
    const pageParam = URLSearch.get('page')
    if (pageParam) {
      setPage(parseInt(pageParam))
    }
    
  }, [])

const buildQuery = (
  categories: string[],
  countries: string,
  page: number
  
) => {
    const params = new URLSearchParams();
    if (categories.length > 0) params.set("categories", categories.join(","));
    if (countries && countries.length > 0) params.set("countries", countries);
    
    params.set("page", page.toString());
    params.set("limit", "12");
    
    router.replace(`/shops?${decodeURIComponent(params.toString())}`)
    return params.toString();
  };

useEffect(() => {
  const query = buildQuery( selectedCategories, selectedCountries, page);
  router.replace(`?${query}`, { scroll: false });

  setIsShopLoading(true);
  axiosInstance
    .get(`/product/api/get-filtered-shops?${query}`)
    .then((res) => {
      setShops(res.data.shops);
      setTotalPages(res.data.pagination.totalPages);
    })
    .catch(console.error)
    .finally(() => setIsShopLoading(false));

}, [ selectedCategories, selectedCountries, page]);


    // TOOGLE FEATUERS
    const toggleCategory = (label: string) => {
      setSelectedCategories(prev => prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]);
    };

    const toggleCountry = (label: string) => {
        setSelectedCountries(prev => prev.includes(label) ? label : '');
      };

  return (
    <main className="bg-[#f5f5f5] min-h-screen pb-10">
      <div className="w-full ml-[7.5rem] mt-4">
        <div>
          <h1 className="font-medium text-4xl leading-[1.2] mb-[14px]">
            All Shops
          </h1>
          <div>
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="inline-block p-[1.5px] mx-1 rounded-full">{'>'}</span>
            <span>All Shops</span>
          </div>
          
          <div className="w-full flex flex-col lg:flex-row gap-8 mt-6">
            {/* Sidebar */}
            <section className="w-80 bg-white p-4 space-y-6 shadow rounded">
              {/* Price Filters */}


            {/* FILTERED BY CATEGORIES */}

              <aside>
                <h3 className="font-Poppins font-medium">Categories</h3>
           
                  <ul className="space-y-2 mt-3">
                    {categories?.map((category: any) => (
                      <li key={category.label} className="flex items-center justify-between pb-2">
                        <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.value)}
                            onChange={() => toggleCategory(category.value)}
                          />
                          {category.label}
                        </label>
                      </li>
                    ))}
                  </ul>
              
              </aside>


              {/* FILTERED BY COUNTRIES */}
                  <aside>
                  <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-200 pb-2">
                    Countries
                  </h3>
                  
                  <ul className="space-y-2 !mt-3">
                    {countries?.map((country: string) => (
                      <li key={country} className="flex items-center justify-between">
                        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCountries?.includes(country)}
                            onChange={() => toggleCountry(country)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{country}</span>
                        </label>
                        
                        {/* Optional: Show count */}
                        <span className="text-xs text-gray-500">(120)</span>
                      </li>
                    ))}
                  </ul>
                </aside>
            </section>

             {/* Products Grid - Add this section */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isShopLoading ? (
                  <p>Loading products...</p>
                ) : shops.length > 0 ? (
                  shops.map((shop: any, index: number) => (
                      <ShopCard key={shop.id || shop._id || index} shop={shop}/>
                  ))
                ) : (
                  <p>No Shops found</p>
                )}
              </div>

              {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50">
                      Previous
                    </button>
                  
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 rounded border text-sm ${
                          page === i + 1 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50">
                      Next
                    </button>
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