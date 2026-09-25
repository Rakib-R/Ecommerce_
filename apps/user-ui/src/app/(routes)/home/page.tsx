

import React from 'react'
import { Suspense } from 'react';
import { ProductSection } from '../../shared/modules/home/productSection';
import { LatestSection } from '../../shared/modules/home/latestSection';
import { OfferSection } from '../../shared/modules/home/offerSection';
import { ShopSection } from '../../shared/modules/home/shopSection';

import { GridSkeleton } from '../../utils/skeletons/Skeletons'
import { SmallSkeleton } from '../../utils/skeletons/Skeletons'
import useUser from '../../hooks/useUser';

const Home =  () => {

  const user = useUser();

  return (
    <main className="ml-8 text-center font-semibold text-xl">
      <section>
        {user && (
          <div className='flex mt-8 mr-auto text-2xl'>
            <p>Recommendation for you</p>
            <hr className="mt-2 opacity-50 mb-8" />

          </div>
        )}
      </section>
      <section>
        <h2 className="text-2xl font-medium mt-16">Products</h2>
        <hr className="mt-4 opacity-50 mb-8" />

        <Suspense fallback={<GridSkeleton />}>
          <ProductSection />
        </Suspense>
      </section>

      <section>
        <h2 className="text-2xl font-medium mt-16">Latest Products</h2>
        <hr className="mt-4 opacity-50 mb-8" />

        <Suspense fallback={<GridSkeleton />}>
          <LatestSection />
        </Suspense>
      </section>


      <section>
        <h2 className="text-2xl font-medium mt-16">Top Offers</h2>
        <hr className="mt-4 opacity-50 mb-8" />

        <Suspense fallback={<SmallSkeleton />}>
          <OfferSection />
        </Suspense>
      </section>

    <section>
        <h2 className="text-2xl font-medium mt-16">Top Shops</h2>
        <hr className="mt-4 opacity-50 mb-8" />

        <Suspense fallback={<SmallSkeleton />}>
          <ShopSection />
        </Suspense>
      </section>


    </main>
  )


 }
export default Home