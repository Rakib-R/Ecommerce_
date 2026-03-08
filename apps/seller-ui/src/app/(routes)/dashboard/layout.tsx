  "use client";

  import React from "react";
  import SideBarWrapper from "../../shared/components/sidebar/sideBarWrapper";

  import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
  import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'; 
  import { QueryClient } from "@tanstack/react-query";

  const persister = createAsyncStoragePersister({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  });


  const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className=" min-w-[230px] border-r border-r-slate-200 bg-black">
          <div className="sticky top-0 p-3">
            <SideBarWrapper />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-black text-white">
          {/* <PersistQueryClientProvider client={queryClient} persistOptions={{
            persister,
            dehydrateOptions: {
              shouldDehydrateQuery: (query) =>
                query.state.status === "success", // never cache errors
            },
          }}> */}
            {children}
        {/* </PersistQueryClientProvider> */}
        </main>
      </div>
    );
  };

  export default Layout;