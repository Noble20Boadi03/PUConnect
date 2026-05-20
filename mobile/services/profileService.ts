import { apiClient } from './apiClient';
import type {
  ApiResponse,
  ThemePreference,
  ThemePreferenceData,
  UpdateThemePreferencePayload,
  User,
} from '../types';

/**
 * Profile-related API actions (theme preference, profile data).
 */
export const profileService = {
  /**
   * Fetches the authenticated user's profile including theme preference.
   * @route GET /api/auth/me
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * Persists the user's theme preference on the server.
   * @route PATCH /api/auth/preferences
   */
  async updateThemePreference(
    themePreference: ThemePreference
  ): Promise<ThemePreferenceData> {
    const payload: UpdateThemePreferencePayload = { themePreference };
    const response = await apiClient.patch<ApiResponse<ThemePreferenceData>>(
      '/auth/preferences',
      payload
    );
    return response.data.data;
  },
};

export default profileService;
