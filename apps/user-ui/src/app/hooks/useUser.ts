'use client'

import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../utils/axios";
import { useEffect, useState } from 'react';
import { UserType, UserProfileType } from "src/types";

interface ApiResponse {
  user: UserType; 
}

const fetchUser = async (): Promise<UserType | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse>("/api/logged-in-user");
    return response.data.user ?? null;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

interface UseUserReturn {
  user: UserType & { Points?: number } | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  error: Error | null;
}

const useUser = (): UseUserReturn => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: mounted,
  });

  return { 
    user: data ?? null, 
    isLoading: mounted && isLoading, 
    isError: isError && mounted,
    refetch,
    error: error ?? null
  };
};

export default useUser;