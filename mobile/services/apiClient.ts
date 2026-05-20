import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ENV from '../config';
import { AUTH_TOKEN_KEY } from '../constants';

/**
 * Basic API client configuration using Axios.
 */
export const apiClient = axios.create({
  baseURL: ENV.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors like 401 Unauthorized
    if (error.response?.status === 401) {
      // Logic for logout or token refresh
    }
    return Promise.reject(error);
  }
);

export default apiClient;
