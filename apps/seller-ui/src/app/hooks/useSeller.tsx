

import {useQuery} from '@tanstack/react-query';
import axiosInstance from "../utils/axiosInstance"
import { useEffect, useState } from 'react';

// fetch user data from API
const fetchSeller = async () => {
  try {
    const response = await axiosInstance.get("/api/logged-in-seller");
    return response.data.seller ?? null;  // ✅ never return undefined
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return null;  //! Unauthenticated = null, not undefined and NOT ERROR
    }
    throw error; 
  }
};

const useSeller = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: seller, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: mounted,
});

  return { seller, isLoading, isError, refetch };
};

export default useSeller