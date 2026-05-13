import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://lawassist-backend-nu.vercel.app/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const isAuthEndpoint = (url) => {
  if (!url) return false;
  return url === '/admin/login' || url.startsWith('/auth/');
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (isAuthEndpoint(config.url)) {
      return config;
    }
    try {
      if (config.url?.startsWith('/admin')) {
        const adminToken = await SecureStore.getItemAsync('adminToken');
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      } else {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // SecureStore hata verirse devam et
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (isAuthEndpoint(url)) {
        return Promise.reject(error);
      }
      try {
        if (url.startsWith('/admin')) {
          await SecureStore.deleteItemAsync('adminToken');
          await SecureStore.deleteItemAsync('admin');
        } else {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('user');
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
