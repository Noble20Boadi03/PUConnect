import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  login: (user: User, token: string) => Promise<void>;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';

/**
 * Authentication store for managing user session state with persistent storage.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
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
      // Here you would typically also fetch the user profile with the token
      set({ token, isAuthenticated: !!token, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
