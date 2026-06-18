import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { isAxiosError } from 'axios';
import { User, LogoutResult } from '../types';
import { AUTH_TOKEN_KEY, HAS_COMPLETED_ONBOARDING_KEY, IS_FIRST_LOGIN_SESSION_KEY } from '../constants';
import { authService, settingsService } from '../services';
import { useProfileStore } from './profileStore';
import { registerForPushNotifications } from '../services/pushTokenService';
import { disconnectSocket } from '../lib/socket';

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
  setFirstLoginSession: (value: boolean) => Promise<void>;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  clearAllStoresAndSocket: () => Promise<void>;
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
  setFirstLoginSession: async (value) => {
    if (value) {
      await SecureStore.setItemAsync(IS_FIRST_LOGIN_SESSION_KEY, 'true');
    } else {
      await SecureStore.deleteItemAsync(IS_FIRST_LOGIN_SESSION_KEY);
    }
    set({ isFirstLoginSession: value });
  },
  setHasCompletedOnboarding: async (value) => {
    if (value) {
      await SecureStore.setItemAsync(HAS_COMPLETED_ONBOARDING_KEY, 'true');
    } else {
      await SecureStore.deleteItemAsync(HAS_COMPLETED_ONBOARDING_KEY);
    }
    set({ hasCompletedOnboarding: value });
  },
  completeOnboarding: async () => {
    await SecureStore.setItemAsync(HAS_COMPLETED_ONBOARDING_KEY, 'true');
    await SecureStore.deleteItemAsync(IS_FIRST_LOGIN_SESSION_KEY);
    set({ hasCompletedOnboarding: true, isFirstLoginSession: false });
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
  
  clearAllStoresAndSocket: async () => {
    // Unsubscribe from all socket listeners
    const { useChatStore } = await import('./chatStore');
    const { useNotificationsStore } = await import('./notificationsStore');
    useChatStore.getState().unsubscribeFromMessages();
    useNotificationsStore.getState().unsubscribeFromNotifications();
    
    // Disconnect socket
    disconnectSocket();
    
    // Reset all stores
    const { useMarketStore } = await import('./marketStore');
    const { useServiceRequestsStore } = await import('./serviceRequestsStore');
    const { useProviderReviewsStore } = await import('./providerReviewsStore');
    const { useUserProfileStore } = await import('./userProfileStore');
    
    useChatStore.getState().reset();
    useMarketStore.getState().reset();
    useNotificationsStore.getState().reset();
    useServiceRequestsStore.getState().reset();
    useProviderReviewsStore.getState().reset();
    useUserProfileStore.getState().reset();
  },
  login: async (user, token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    // Check if isFirstLoginSession is in storage
    const isFirstLoginSessionRaw = await SecureStore.getItemAsync(IS_FIRST_LOGIN_SESSION_KEY);
    const isFirstLoginSession = isFirstLoginSessionRaw === 'true';
    set({ user, token, isAuthenticated: true, isFirstLoginSession });
    // If not a first login session, mark onboarding as completed
    if (!isFirstLoginSession) {
      await get().setHasCompletedOnboarding(true);
    }
    // Register for push notifications
    (async () => {
      try {
        const pushToken = await registerForPushNotifications();
        if (pushToken) {
          await authService.updatePushToken(pushToken);
        }
      } catch (error) {
        console.error('Error registering for push notifications after login:', error);
      }
    })();
  },
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const hasCompletedOnboardingRaw = await SecureStore.getItemAsync(HAS_COMPLETED_ONBOARDING_KEY);
      const hasCompletedOnboarding = hasCompletedOnboardingRaw === 'true';
      const isFirstLoginSessionRaw = await SecureStore.getItemAsync(IS_FIRST_LOGIN_SESSION_KEY);
      const isFirstLoginSession = isFirstLoginSessionRaw === 'true';

      if (!token) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding, isFirstLoginSession: false });
        return;
      }

      try {
        const user = await authService.getMe();
        set({ user, token, isAuthenticated: true, isLoading: false, hasCompletedOnboarding, isFirstLoginSession });
        // For existing users who haven't had the onboarding flag persisted yet and aren't in first login session
        if (!hasCompletedOnboarding && !isFirstLoginSession) {
          await get().setHasCompletedOnboarding(true);
        }
        // Register for push notifications
        (async () => {
          try {
            const pushToken = await registerForPushNotifications();
            if (pushToken) {
              await authService.updatePushToken(pushToken);
            }
          } catch (error) {
            console.error('Error registering for push notifications during initialize:', error);
          }
        })();
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(IS_FIRST_LOGIN_SESSION_KEY);
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding, isFirstLoginSession: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding: false, isFirstLoginSession: false });
    }
  },
  clearSession: async () => {
    // Use try/catch to make this idempotent — safe to call multiple times
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
    try {
      await SecureStore.deleteItemAsync(HAS_COMPLETED_ONBOARDING_KEY);
    } catch {}
    try {
      await SecureStore.deleteItemAsync(IS_FIRST_LOGIN_SESSION_KEY);
    } catch {}
    // Check if we're already cleared to avoid duplicate work
    const currentState = get();
    if (!currentState.user && !currentState.token && !currentState.isAuthenticated) {
      return;
    }
    // Call clearAllStoresAndSocket to reset everything
    await get().clearAllStoresAndSocket();
    // Reset profile store as well (since it's already being done before)
    const { useProfileStore } = await import('./profileStore');
    await useProfileStore.getState().resetLocal();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false, isFirstLoginSession: false });
  },
  logout: async () => {
    let result: LogoutResult;
    try {
      result = await settingsService.logout();
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      await SecureStore.deleteItemAsync(HAS_COMPLETED_ONBOARDING_KEY).catch(() => {});
      await SecureStore.deleteItemAsync(IS_FIRST_LOGIN_SESSION_KEY).catch(() => {});
      result = {
        success: true,
        message: 'Signed out on this device.',
        apiReached: false,
      };
    }
    // Clear all stores and disconnect socket
    await get().clearAllStoresAndSocket();
    // Reset profile store
    const { useProfileStore } = await import('./profileStore');
    await useProfileStore.getState().resetLocal();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false, isFirstLoginSession: false });
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
    await SecureStore.deleteItemAsync(IS_FIRST_LOGIN_SESSION_KEY).catch(() => {});
    // Clear all stores and disconnect socket
    await get().clearAllStoresAndSocket();
    // Reset profile store
    const { useProfileStore } = await import('./profileStore');
    await useProfileStore.getState().resetLocal();
    useProfileStore.setState({ hydrated: false });
    set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false, isFirstLoginSession: false });
    return result;
  },
}));

export default useAuthStore;
