import { authService } from './authService';
import type { LogoutResponse, LogoutResult } from '../types';
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '../constants';

/**
 * Settings-related API actions.
 */
export const settingsService = {
  /**
   * Ends the remote session (when a token exists) and clears local credentials.
   */
  async logout(): Promise<LogoutResult> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    let apiReached = false;
    let message = 'Logged out successfully.';

    if (token) {
      try {
        const response: LogoutResponse = await authService.logout();
        apiReached = true;
        message = response.message ?? message;
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        message =
          axiosError.response?.data?.message ??
          axiosError.message ??
          'Could not reach the server. You have been signed out on this device.';
      }
    }

    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);

    return {
      success: true,
      message,
      apiReached,
    };
  },
};

export default settingsService;
