'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from 'src/app/utils/axios'
import Link from 'next/link'
import { Range } from 'react-range';
import ProductCard from 'src/app/shared/components/cards/product-card'

const MIN = 0;
const MAX = 1199;

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);


  const colors = [
  { name: "Black", code: "#000000" },
  { name: "Red", code: "#FF0000" },
  { name: "Green", code: "#008000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Magenta", code: "#FF00FF" },
];

  const sizes = [ "XS", "S", "M", 'L', "XL", "XXL"];

  useEffect(() => {
    // Read price range from URL
    const URLSearch = new URLSearchParams(window.location.search);
    const priceRangeParam = URLSearch.get('priceRange');

    if (priceRangeParam) {
      const [min, max] = priceRangeParam.split(',').map(Number)
      setPriceRange([min, max])
      setTempPriceRange([min, max])
    }
    
    // Read page from URL
    const pageParam = URLSearch.get('page')
    if (pageParam) {
      setPage(parseInt(pageParam))
    }
  }, [])

const buildQuery = (
  priceRange: number[],
  categories: string[],
  colors: string[],
  sizes: string[],
  page: number
  
) => {
    const params = new URLSearchParams();
    params.set("priceRange", priceRange.join(","));
    if (categories.length > 0) params.set("categories", categories.join(","));
    if (colors.length > 0) params.set("colors", colors.join(","));
    if (sizes.length > 0) params.set("sizes", sizes.join(","));
    params.set("page", page.toString());
    params.set("limit", "12");
    return params.toString();
  };

useEffect(() => {
  const query = buildQuery(priceRange, selectedCategories, selectedColors, selectedSizes, page);
  router.replace(`?${query}`, { scroll: false });

  setIsProductLoading(true);
  axiosInstance
    .get(`/product/api/get-filtered-products?${query}`)
    .then((res) => {
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
    })
    .catch(console.error)
    .finally(() => setIsProductLoading(false));

}, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);


  const toggleCategory = (label: string) => {
    setSelectedCategories(prev => prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(item => item !== color) : [...prev, color]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size]);
  };

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async() => {
      const res = await axiosInstance.get('/product/api/get-categories');
      return res.data.categories;
    },
    staleTime: 1000 * 60 * 30,
  });

  return (
    <main className="bg-[#f5f5f5] min-h-screen pb-10">
      <div className="w-full ml-[7.5rem] mt-4">
        <div>
          <h1 className="font-medium text-4xl leading-[1.2] mb-[14px]">
            All Products
          </h1>
          <div>
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="inline-block p-[1.5px] mx-1 rounded-full">{'>'}</span>
            <span>All Products</span>
          </div>
          
          <div className="w-full flex flex-col lg:flex-row gap-8 mt-6">
            {/* Sidebar */}
            <section className="w-80 bg-white p-4 space-y-6 shadow rounded">
              {/* Price Filters */}
              <aside>
                <h3 className="font-Poppins font-medium">Price Filters</h3>
                <div className="ml-2 mt-4">
                  {mounted && (
                    <Range
                      step={10}
                      min={MIN}
                      max={MAX}
                      values={tempPriceRange}
                      onChange={(values) => setTempPriceRange(values)}

                      renderTrack={({ props, children }) => {
                        const [min, max] = tempPriceRange;
                        const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                        const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                        return (
                          <div
                            {...props}
                            className="h-[6px] rounded relative "
                            style={props.style}>
                            <div
                              className="absolute h-full rounded bg-blue-500"
                              style={{
                                left: `${percentageLeft}%`,
                                right: `${100- percentageRight}%`,
                              }}
                            />
                            {children}
                          </div>
                        );
                      }}
                      renderThumb={({ props }) => {
                        const { key, ...restProps } = props;
                        return (
                          <div
                            key={key}
                            className="h-4 w-4 bg-blue-500 border-2 border-blue-500 rounded-full shadow cursor-pointer"
                            {...restProps}
                          />
                        );
                      }}
                    />
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm">
                      ${tempPriceRange[0]} - ${tempPriceRange[1]}
                    </div>
                    <button
                      onClick={() => {
                        setPriceRange(tempPriceRange);
                        setPage(1);
                      }}
                      className="text-sm px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded">
                      Apply
                    </button>
                  </div>
                </div>
              </aside>

              {/* Categories */}
              <aside>
                <h3 className="font-Poppins font-medium">Categories</h3>
                {isLoading ? (
                  <p className="mt-2">Loading...</p>
                ) : (
                  <ul className="space-y-2 mt-3">
                    {categories?.map((category: string) => (
                      <li key={category} className="flex items-center justify-between pb-2">
                        <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          {category}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>

            {/* FILTERED BY COLOR */}
             <aside>
              <ul className="mt-3">
                {colors.map((color) => (
                  <li key={color.name} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color.name)}
                        onChange={() => toggleColor(color.name)}
                        className="w-4 h-4"
                      />
                      <span
                        className="h-[16px] w-[16px] rounded-full border border-gray-200"
                        style={{ backgroundColor: color.code }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
             </aside>
              
              {/* FILTERED BY SIZE */}
             <aside>
              <ul className="mt-3">
                {sizes.map((size) => (
                  <li key={size} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  </li>
                ))}
              </ul>
             </aside>

            </section>

            {/* Products Grid - Add this section */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isProductLoading ? (
                  <p>Loading products...</p>
                ) : products.length > 0 ? (
                  products.map((product: any, index: number) => (
                      <ProductCard key={product.id || product._id || index} product={product}/>
                  ))
                ) : (
                  <p>No products found</p>
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