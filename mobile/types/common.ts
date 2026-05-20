/**
 * Global API response interface.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * API responses that return only status and message (no data payload).
 */
export interface ApiMessageResponse {
  status: number;
  message: string;
}

import type { ThemePreference } from './theme';

/**
 * Common User interface.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role?: 'user' | 'admin';
  avatarUrl?: string;
  themePreference?: ThemePreference;
}

/**
 * Authentication response.
 */
export interface AuthResponse {
  user: User;
  token: string;
}
