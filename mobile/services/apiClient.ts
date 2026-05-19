import axios from 'axios';
import ENV from '@/config';

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

// Request interceptor for adding auth tokens, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Add logic to attach auth token from store if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
