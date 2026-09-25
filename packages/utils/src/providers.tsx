"use client"

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';

const Providers = ({ children }: { children: React.ReactNode }) => {

 const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes cache stability
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page restored from bfcache - refresh data
        queryClient.invalidateQueries();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
       <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#18181b", // Zinc 900
            color: "#fff",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            border: "1px solid #27272a", // Zinc 800 subtle border
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

    </QueryClientProvider>
  );
}

export default Providers;