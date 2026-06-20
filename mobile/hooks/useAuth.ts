import { useAuthStore } from '../store/authStore';
import type { AuthState } from '../store/authStore';

export function useAuth<T = AuthState>(selector?: (state: AuthState) => T): T {
  return useAuthStore(selector ?? ((s) => s as unknown as T));
}

export default useAuth;
