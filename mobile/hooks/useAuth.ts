import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to access authentication state and actions.
 * 
 * @returns Authentication state and actions.
 */
export function useAuth() {
  return useAuthStore();
}

export default useAuth;
