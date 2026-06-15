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

// Public endpoints that legitimately return 401 for invalid credentials —
// a 401 from these should NOT clear the session.
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password'];

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors like 401 Unauthorized, but only for
    // protected endpoints — not public auth routes that return 401
    // for wrong credentials.
    if (error.response?.status === 401) {
      const requestPath = error.config?.url || '';
      const isPublicAuth = PUBLIC_AUTH_PATHS.some((p) => requestPath.includes(p));
      if (!isPublicAuth) {
        void import('../store/authStore').then(({ useAuthStore }) => {
          void useAuthStore.getState().clearSession();
        });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
