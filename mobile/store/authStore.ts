import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { isAxiosError } from 'axios';
import { User, LogoutResult } from '../types';
import { AUTH_TOKEN_KEY, HAS_COMPLETED_ONBOARDING_KEY } from '../constants';
import { authService, settingsService } from '../services';
import { useProfileStore } from './profileStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  isFirstLoginSession: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  login: (user: User, token: string) => Promise<void>;
  initialize: () => Promise<void>;
  logout: () => Promise<LogoutResult>;
  deleteAccount: () => Promise<LogoutResult>;
  clearSession: () => Promise<void>;
  setFirstLoginSession: (value: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
}

const TOKEN_KEY = AUTH_TOKEN_KEY;

/**
 * Authentication store for managing user session state with persistent storage.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  hasCompletedOnboarding: false,
  isFirstLoginSession: false,
  setFirstLoginSession: (value) => set({ isFirstLoginSession: value }),
  setHasCompletedOnboarding: async (value) => {
    if (value) {
      await SecureStore.setItemAsync(HAS_COMPLETED_ONBOARDING_KEY, 'true');
    } else {
      await SecureStore.deleteItemAsync(HAS_COMPLETED_ONBOARDING_KEY);
    }
    set({ hasCompletedOnboarding: value });
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    set({ token, isAuthenticated: !!token });
  },
  login: async (user, token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
    // If not a first login session, mark onboarding as completed
    if (!get().isFirstLoginSession) {
      await get().setHasCompletedOnboarding(true);
    }
  },
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const hasCompletedOnboardingRaw = await SecureStore.getItemAsync(HAS_COMPLETED_ONBOARDING_KEY);
      const hasCompletedOnboarding = hasCompletedOnboardingRaw === 'true';

      if (!token) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding });
        return;
      }

      try {
        const user = await authService.getMe();
        set({ user, token, isAuthenticated: true, isLoading: false, hasCompletedOnboarding });
        // For existing users who haven't had the onboarding flag persisted yet
        if (!hasCompletedOnboarding) {
          await get().setHasCompletedOnboarding(true);
        }
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding: false });
    }
  },
  clearSession: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(HAS_COMPLETED_ONBOARDING_KEY);
    const { useProfileStore } = await import('./profileStore');
    // Use resetLocal() instead of clearProviderProfile() because clearSession
    // is called when the token is already invalid/expired — API calls would
    // fail with 401 and cause cascading errors.
    await useProfileStore.getState().resetLocal();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false });
  },
  logout: async () => {
    let result: LogoutResult;
    try {
      result = await settingsService.logout();
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      await SecureStore.deleteItemAsync(HAS_COMPLETED_ONBOARDING_KEY).catch(() => {});
      result = {
        success: true,
        message: 'Signed out on this device.',
        apiReached: false,
      };
    }
    const { useProfileStore } = await import('./profileStore');
    await useProfileStore.getState().resetLocal();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false });
    return result;
  },
  deleteAccount: async () => {
    let result: LogoutResult;
    let apiReached = false;
    let message = 'Account deleted successfully.';

    try {
      const response = await authService.deleteAccount();
      apiReached = true;
      message = response.message ?? message;
      result = { success: true, message, apiReached };
    } catch {
      message = 'Could not reach the server. Please try again.';
      result = { success: false, message, apiReached: false };
      return result;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(HAS_COMPLETED_ONBOARDING_KEY).catch(() => {});
    const { useProfileStore } = await import('./profileStore');
    await useProfileStore.getState().resetLocal();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false });
    return result;
  },
}));

export default useAuthStore;
