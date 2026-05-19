import { useAuthStore } from '@/store/authStore';

/**
 * Custom hook to access authentication state and actions.
 * 
 * @returns Authentication state and actions.
 */
export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // You can add logic for token refreshing or complex auth flows here
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}

export default useAuth;
