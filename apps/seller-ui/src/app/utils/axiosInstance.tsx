

//!!!!!!  THIS IS ONE FROM   !!!!!!!!!!!!!!

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,   //! IT WAS EMPTY FOR A REASON !
   withCredentials: true,  // sends cookies automatically
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};


axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle token refresh on 401
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) =>
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)))
        );
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post(`/api/refresh-token`);
        isRefreshing = false;
        onRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        useAuthStore.getState().handleLogout()
        return Promise.reject(err);
      }
    }
    
    // Handle 503 - service unavailable (backend down)
    if (status === 503) {
      console.error("Service unavailable:", originalRequest?.url || "Unknown URL");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;