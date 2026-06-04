'use client'

import React, { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { categories } from '../../configs/categories'
import { countries } from '../../configs/countries'

interface FilterSidebarProps {
  initialCategories: string[];
  initialCountry: string;
}

interface countryProps {
  name: string;
  code: string;
  currency: string;
}

const FilterSidebar = ({ initialCategories, initialCountry }: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Helper function to mutate URL params cleanly
  const updateQueryParams = (newCategories: string[], newCountry: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset back to page 1 when filters alter
    params.set('page', '1');

    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','));
    } else {
      params.delete('categories');
    }

    if (newCountry) {
      params.set('countries', newCountry);
    } else {
      params.delete('countries');
    }

    // startTransition keeps user interaction responsive while Next.js fetches data behind the scenes
    startTransition(() => {
      router.replace(`/shops?${params.toString()}`, { scroll: false });
    });
  };

  const toggleCategory = (value: string) => {
    const updated = initialCategories.includes(value)
      ? initialCategories.filter((c) => c !== value)
      : [...initialCategories, value];
    updateQueryParams(updated, initialCountry);
  };

  const toggleCountry = (name: string) => {
    const updatedCountry = initialCountry === name ? '' : name;
    updateQueryParams(initialCategories, updatedCountry);
  };

  return (
    <section className={`w-80 bg-white p-4 space-y-6 shadow rounded transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Categories Filter */}
      <aside>
        <h3 className="font-Poppins font-medium">Categories</h3>
        <ul className="space-y-2 mt-3">
          {categories?.map((category) => (
            <li key={category.label} className="flex items-center justify-between pb-2">
              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialCategories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                />
                {category.label}
              </label>
            </li>
          ))}
        </ul>
      </aside>

      {/* Countries Filter */}
      <aside>
        <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-200 pb-2">
          Countries
        </h3>
        <ul className="space-y-2 !mt-3">
          {countries?.map((country: countryProps) => (
            <li key={country.code} className="flex items-center justify-between">
              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialCountry === country.name}
                  onChange={() => toggleCountry(country.name)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{country.name}</span>
              </label>
              <span className="text-xs text-gray-500">(120)</span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}

export default FilterSidebar;