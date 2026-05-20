import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store';
import type { SettingsLogoutState } from '../types';

/**
 * Logout flow for the Settings screen: custom confirmation, API logout, redirect to login.
 */
export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [state, setState] = useState<SettingsLogoutState>({
    isLoading: false,
    error: null,
    confirmVisible: false,
  });

  const openLogoutDialog = useCallback(() => {
    if (state.isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((prev) => ({ ...prev, confirmVisible: true, error: null }));
  }, [state.isLoading]);

  const closeLogoutDialog = useCallback(() => {
    if (state.isLoading) return;
    setState((prev) => ({ ...prev, confirmVisible: false }));
  }, [state.isLoading]);

  const confirmLogout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await logout();
      setState({ isLoading: false, error: null, confirmVisible: false });
      router.replace('/(auth)/login');
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        confirmVisible: false,
        error: 'Something went wrong while signing out. Please try again.',
      }));
    }
  }, [logout, router]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    confirmVisible: state.confirmVisible,
    openLogoutDialog,
    closeLogoutDialog,
    confirmLogout,
    clearError,
  };
}

export default useLogout;
