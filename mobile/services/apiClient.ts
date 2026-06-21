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
  timeout: 30000,
});

apiClient.interceptors.request.use(
  async (config) => {
    console.log('[TIMESTAMP] 4a. Request interceptor start (before SecureStore):', new Date().toISOString(), 'URL:', config.url);
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    console.log('[TIMESTAMP] 4b. Request interceptor end (after SecureStore):', new Date().toISOString());
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
  (response) => {
    console.log('[TIMESTAMP] 5. Response interceptor received response (success):', new Date().toISOString(), 'URL:', response.config.url);
    return response;
  },
  (error) => {
    console.log('[TIMESTAMP] 5. Response interceptor received response (error):', new Date().toISOString(), 'URL:', error.config?.url, 'Status:', error.response?.status);
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
