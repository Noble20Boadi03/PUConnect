import { useAuthStore } from '../store/authStore';
import type { AuthState } from '../store/authStore';
import { useShallow } from 'zustand/react/shallow';

export function useAuth<T = AuthState>(selector?: (state: AuthState) => T): T {
  if (selector) {
    return useAuthStore(selector);
  }
  return useAuthStore(useShallow((s) => s as unknown as T));
}

export default useAuth;
