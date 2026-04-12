
'use client'

import {useQuery} from '@tanstack/react-query';
import axiosInstance from "../utils/axios"
import { useEffect, useState } from 'react';

// fetch user data from API
 const fetchUser = async () => {
    try {
    const response = await axiosInstance.get("/api/logged-in-user");
    return response.data.user ?? null;  // ✅ never return undefined

  } catch (error: any) {
    if (error?.response?.status === 401) {
      return null;  //! Unauthenticated = null, not undefined and NOT ERROR
    }
    throw error; 
  }
};

const useUser = () => {

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: user, isLoading, isError, refetch } = useQuery({
   queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    // enabled: mounted, //todo ← ADDING this ENSURES query fails (401), 
    // React Query doesn't keep retrying and sets data to undefined
    retryOnMount: false,
});

  return { user: user ?? null, isLoading: mounted && isLoading, isError: isError && user === undefined, refetch };
};

export default useUser