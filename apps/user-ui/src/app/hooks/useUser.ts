

import {useQuery} from '@tanstack/react-query';
import axiosInstance from "../utils/axios"

// fetch user data from API
 const fetchUser = async () => {
    try {
    const response = await axiosInstance.get("/api/logged-in-user");
    return response.data.user ?? null;  // ✅ never return undefined

  } catch (error: any) {
    if (error?.response?.status === 401) {
      return null;  //! ✅ Unauthenticated = null, not undefined and NOT ERROR
    }
    throw error; 
  }
};

const useUser = () => {
  const { data: user, isLoading, isError, refetch } = useQuery({
   queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,

    // 🔥 This ensures that when the query fails (401), 
    // React Query doesn't keep retrying and sets data to undefined
    retryOnMount: false,
});

  return { user, isLoading, isError, refetch };
};

export default useUser