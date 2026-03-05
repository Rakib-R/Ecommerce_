

//!!!!!!  THIS IS ONE FROM  TUTORIAL !!!!!!!!!!!!!!

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// ✅ Attach request interceptor
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ✅ Attach response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) =>
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)))
        );
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`
        );

        isRefreshing = false;
        onRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Export the instance itself
export default axiosInstance;