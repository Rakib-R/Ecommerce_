import axios from "axios";
import { useAuthState } from "../store/authStore";
import { queryClient } from '@packages/utils';

// 1. Primary instance for general app traffic
const axiosInstance = axios.create({
   baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
   withCredentials: true, 
});

// 2. ISOLATED instance used strictly for token renewals
const refreshClient = axios.create({
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

    // Only handle 401 Unauthorized errors, ignore everything else early
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Standard public auth routes to skip intercepting entirely
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
      return Promise.reject(error); 
    }

    // Don't retry the refresh endpoint itself to prevent infinite loops
    if (originalRequest.url?.includes('/api/refreshToken_User')) {
      useAuthState.getState().handleLogout();
      queryClient.setQueryData(['user'], null);
      return Promise.reject(error);
    }

    // 3. Token Refresh Execution Process
    if (!originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          subscribeTokenRefresh((success) => {
            if (success) {
              resolve(axiosInstance(originalRequest));
            } else {
              // If background refresh failed while this request was waiting in queue
              if (originalRequest.url?.includes('/api/logged-in-user')) {
                resolve({
                  data: { user: null },
                  status: 200,
                  statusText: 'FORCEFULL RESOLVING',
                  headers: error.response?.headers,
                  config: originalRequest
                });
              } else {
                reject(new Error('Token refresh failed'));
              }
            }
          })
        );
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use the clean, isolated refreshClient here
        await refreshClient.post(`/api/refreshToken_User`);
        
        isRefreshing = false;
        onRefreshSuccess();

        // Sync local React Query state
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        // Re-run original request with fresh cookies
        return axiosInstance(originalRequest);
      }  
      catch (err: any) {
        isRefreshing = false;
        onRefreshFailure(); 
        
        // CRITICAL FIX: If the session checking route caused this, don't force logout state.
        // Just return the clean fallback null payload.
        if (originalRequest.url?.includes('/api/logged-in-user')) {
          queryClient.setQueryData(['user'], null);
          return Promise.resolve({
             data: { user: null },
             status: 200,
             statusText: 'FORCEFULL RESOLVING',
             headers: error.response?.headers,
             config: originalRequest
          });
        }

        // If a regular application endpoint (like /api/products) hits a dead refresh token, force logout.
        useAuthState.getState().handleLogout();
        queryClient.setQueryData(['user'], null);
        
        return Promise.reject(err);
      }
    }
    
    // Fallback if a request fails a second time even after a retry attempt
    if (originalRequest.url?.includes('/api/logged-in-user')) {
      return Promise.resolve({
         data: { user: null },
         status: 200,
         statusText: 'FORCEFULL RESOLVING',
         headers: error.response?.headers,
         config: originalRequest
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
