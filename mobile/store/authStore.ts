import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { isAxiosError } from 'axios';
import { User, LogoutResult } from '../types';
import { AUTH_TOKEN_KEY } from '../constants';
import { authService, settingsService } from '../services';
import { useProfileStore } from './profileStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  login: (user: User, token: string) => Promise<void>;
  initialize: () => Promise<void>;
  logout: () => Promise<LogoutResult>;
  clearSession: () => Promise<void>;
  isFirstLoginSession: boolean;
  setFirstLoginSession: (value: boolean) => void;
}

const TOKEN_KEY = AUTH_TOKEN_KEY;

/**
 * Authentication store for managing user session state with persistent storage.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isFirstLoginSession: false,
  setFirstLoginSession: (value) => set({ isFirstLoginSession: value }),
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
  },
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const user = await authService.getMe();
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
  clearSession: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await useProfileStore.getState().clearProviderProfile();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false });
  },
  logout: async () => {
    let result: LogoutResult;
    try {
      result = await settingsService.logout();
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      result = {
        success: true,
        message: 'Signed out on this device.',
        apiReached: false,
      };
    }
    await useProfileStore.getState().clearProviderProfile();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false });
    return result;
  },
}));

export default useAuthStore;
