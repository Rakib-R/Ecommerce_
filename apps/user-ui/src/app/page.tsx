import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { auth } from '@apps/auth-service';

export default async function Page() {

  const localQueryClient = new QueryClient();

      await localQueryClient.prefetchQuery({
      queryKey: ['user'],
      queryFn: async () => {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        return session?.user || null;
      },
    });
  return (

    <HydrationBoundary state={dehydrate(localQueryClient)}>

        <main>

        </main>
    </HydrationBoundary>

  );
}