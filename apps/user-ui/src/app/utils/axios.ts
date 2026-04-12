// utils/axios-instance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

const subscribeTokenRefresh = (callback: (success: boolean) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((cb) => cb(true));
  refreshSubscribers = [];
};
const onRefreshFailure = () => {
  refreshSubscribers.forEach((cb) => cb(false));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ ADD THIS - Special handling for logged-in-user endpoint
    if (originalRequest.url?.includes('/api/logged-in-user')) {
      // Return successful response instead of rejecting
      return Promise.resolve({ 
        data: { user: null },
        status: 200,
        statusText: 'OK'
      });
    }

      const skipRefreshRoutes = [
      '/api/home', '/api/seller-registration', '/api/register-user',
      '/api/login',
      '/api/signup',
      '/api/seller-login',
      '/api/seller-signup', '/api/admin',
      '/api/forgot-password-user', '/api/forgot-password-seller',
    ];

      const isAuthRoute = skipRefreshRoutes.some(r => 
        originalRequest.url?.includes(r)
    );

    if (isAuthRoute) {
      return Promise.reject(error); // ← return immediately, no refresh
    }
    
     // Only handle 401s, skip everything else
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    
    // Don't retry the refresh endpoint itself — would cause infinite loop
    if (originalRequest.url?.includes('/api/refresh-token')) {

      const { useAuthState } = await import("../store/authStore");
      const { queryClient } = await import("@apps/utils/queryClient");
        useAuthState.getState().logout();
        queryClient.setQueryData(['user'], null);
        return Promise.reject(error);
    }

    if (!originalRequest._retry) {
      if (isRefreshing) {
         return new Promise((resolve, reject) =>
        subscribeTokenRefresh((success) => {
          if (success) resolve(axiosInstance(originalRequest));
          else reject(new Error('Token refresh failed'));
        })
      )
     }
      
      originalRequest._retry = true;
      isRefreshing = true;

    try {
      await axiosInstance.post("/api/refresh-token")

      isRefreshing = false;
      onRefreshSuccess();
        
    // Invalidate user query to refetch with new token
    const { queryClient } = await import("@apps/utils/queryClient");
    queryClient.invalidateQueries({ queryKey: ['user'] });

    return axiosInstance(originalRequest);
    } catch (err:any) {
        onRefreshFailure(); 
        isRefreshing = false;
        if (err.response?.status === 401 || err.response?.status === 400) {
          
          const { useAuthState } = await import("../store/authStore");
          useAuthState.getState().handleLogout();
      }
      // Clear user data on refresh failure

      const { queryClient } = await import("@apps/utils/queryClient");
      queryClient.setQueryData(['user'], null);
      return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;