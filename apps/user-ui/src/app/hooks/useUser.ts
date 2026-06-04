
'use client'

import { authClient } from "../configs/auth-client"; // 👈 Adjust path to your auth-client config
import { UserType } from '../../types';

export default function useUser (){

  // and reactively updates state across your React app out-of-the-box.
  const { data: session, isPending, error } = authClient.useSession();

  return {
    user: (session?.user as unknown as UserType) || null,
    isLoading: isPending,
    error: error || null,
    isAuthenticated: !!session,
  };
};




// 'use client' 


// import { useQuery } from '@tanstack/react-query';
// import axiosInstance from "../utils/axios";
// import { useEffect, useState } from 'react';
// import { UserType } from '../../types';
// import axios from 'axios';

// interface ApiResponse {
//   user: UserType; 
// }

// const fetchUser = async (): Promise<UserType | null> => {
//   try {
//     const response = await axiosInstance.get<ApiResponse>("/api/logged-in-user");
//     return response.data.user ?? null;
//   } catch (error: unknown) {
//     if (axios.isAxiosError(error) && error?.response?.status === 401) {
//       return null;
//     }
//     throw error;
//   }
// };

// interface UseUserReturn {
//   user: UserType | null;
//   isLoading: boolean;
//   isError: boolean;
//   refetch: () => void;
//   error: Error | null;
// }

// const useUser = (): UseUserReturn => {
  
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);
  
//   const { data, isLoading, isError, refetch, error } = useQuery({
//     queryKey: ["user"],
//     queryFn: fetchUser,
//     staleTime: 1000 * 60 * 5,
//     gcTime: 1000 * 60 * 10,
//     retry: false,
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//     enabled: mounted,
//   });

//   return { 
//     user: data ?? null, 
//     isLoading: mounted && isLoading, 
//     isError: isError && mounted,
//     refetch,
//     error: error
//   };
// };

// export default useUser;



