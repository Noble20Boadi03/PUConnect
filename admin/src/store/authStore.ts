import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/admin';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        set({ token, user });
      },
      logout: () => {
        // Clear Zustand store first
        set({ token: null, user: null });
        // Redirect to login page
        window.location.href = '/login';
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);