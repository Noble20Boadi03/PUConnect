/**
 * Global API response interface.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Common User interface.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin';
  avatarUrl?: string;
}

/**
 * Authentication response.
 */
export interface AuthResponse {
  user: User;
  token: string;
}
