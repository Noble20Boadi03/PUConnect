import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store';
import { useAppRouter } from './useAppRouter';
import type { SettingsLogoutState } from '../types';

/**
 * Delete account flow for the Settings screen: custom confirmation, API delete account, redirect to login.
 */
export function useDeleteAccount() {
  const router = useAppRouter();
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const [state, setState] = useState<SettingsLogoutState>({
    isLoading: false,
    error: null,
    confirmVisible: false,
  });

  const openDeleteAccountDialog = useCallback(() => {
    if (state.isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState((prev) => ({ ...prev, confirmVisible: true, error: null }));
  }, [state.isLoading]);

  const closeDeleteAccountDialog = useCallback(() => {
    if (state.isLoading) return;
    setState((prev) => ({ ...prev, confirmVisible: false }));
  }, [state.isLoading]);

  const confirmDeleteAccount = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await deleteAccount();
      if (!result.success) {
        throw new Error(result.message);
      }
      setState({ isLoading: false, error: null, confirmVisible: false });
      router.replace('/(auth)/login' as any);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        confirmVisible: false,
        error: error?.message ?? 'Something went wrong while deleting your account. Please try again.',
      }));
    }
  }, [deleteAccount, router]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    confirmVisible: state.confirmVisible,
    openDeleteAccountDialog,
    closeDeleteAccountDialog,
    confirmDeleteAccount,
    clearError,
  };
}

export default useDeleteAccount;