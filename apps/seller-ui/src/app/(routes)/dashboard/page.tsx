
import React from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@apps/auth-service';
import { Toaster } from 'react-hot-toast';

const Page = async () => {

  const localQueryClient = new QueryClient();

   await localQueryClient.prefetchQuery({
    queryKey: ['seller'],
    queryFn: async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      return session?.user || null;
    },
  });

   const sellerData = localQueryClient.getQueryData(['seller']);

  if (!sellerData) {
    redirect('/seller-login');
  }

  return (

  <HydrationBoundary state={dehydrate(localQueryClient)}>
    <div className='m-4 underline'>
      DashBoard default page

    <section className="bg-amber-50 border-l-4 mt-8 border-amber-500 rounded-r-lg p-4 my-4">
        <div className="flex items-center gap-3">
        <span className="text-2xl">🚧</span>
        <div>
          <p className="font-semibold text-amber-800">Only selected fields are fully developed</p>
          <p className="text-sm text-amber-600 mt-1">The remaining features are currently in progress and will be available soon.</p>
        </div>
      </div>
  </section>

    <Toaster position="top-right" />

</div>
    </HydrationBoundary>
  )
}

export default Page