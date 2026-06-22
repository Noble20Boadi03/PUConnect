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
import type { ExploreCategoryId } from './explore';

export type UserRole = 'user' | 'provider' | 'admin';
export type AdminTier = 'super_admin' | 'moderator' | 'support';
export type ProviderApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

/**
 * Common User interface matching Prisma schema.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  adminTier?: AdminTier;
  providerApprovalStatus?: ProviderApprovalStatus;
  avatarUrl: string;
  bio: string;
  categoryId?: ExploreCategoryId;
  skillTitle?: string;
  expertiseTags: string[];
  serviceIds: string[];
  themePreference?: ThemePreference;
  services?: Array<{ id: string; title: string; categoryId: string }>;
}

/**
 * Authentication response.
 */
export interface AuthResponse {
  user: User;
  token: string;
}
