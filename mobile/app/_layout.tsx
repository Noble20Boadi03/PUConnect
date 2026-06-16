import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuthStore, useProfileStore, useChatStore, useNotificationsStore, useServiceRequestsStore, useUserProfileStore } from '../store';
import { useProviderReviewsStore } from '../store/providerReviewsStore';
import { initializeThemePreference } from '../lib/themePreference';
import { runGuardedNavigation } from '../lib/guardedNavigation';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { applyThemeSystemChrome } from '../lib/systemChrome';
import { useMarketStore } from '../store/marketStore';
import { useExploreStore } from '../store/exploreStore';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, initialize, user, isFirstLoginSession, hasCompletedOnboarding } = useAuthStore();
  const hydrateProfile = useProfileStore((s) => s.hydrate);
  const { subscribeToMessages, fetchConversations } = useChatStore();
  const { subscribeToNotifications, fetchNotifications } = useNotificationsStore();
  const { fetchRequests, subscribeToUpdates } = useServiceRequestsStore();
  const { fetchPosts } = useMarketStore();
  const { fetchExploreData } = useExploreStore();
  const { fetchProfile } = useUserProfileStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
    initializeThemePreference();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void hydrateProfile(user);
      fetchConversations();
      subscribeToMessages();
      fetchNotifications();
      subscribeToNotifications();
      void fetchRequests().then(() => {
        const deals = useServiceRequestsStore.getState().getCompletedDealsForReviews();
        useProviderReviewsStore.getState().syncCompletedDealsFromRequests(deals);
      });
      const unsubscribeServiceRequests = subscribeToUpdates();
      
      // Background prefetching (fire-and-forget, respect cache TTL)
      fetchPosts();
      fetchExploreData();
      if (user?.username) {
        fetchProfile(user.username);
      }
      
      return () => {
        unsubscribeServiceRequests();
      };
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    hydrateProfile,
    fetchConversations,
    subscribeToMessages,
    fetchNotifications,
    subscribeToNotifications,
    fetchRequests,
    subscribeToUpdates,
    fetchPosts,
    fetchExploreData,
    fetchProfile,
  ]);

  // Authenticated users skip the landing page — hide splash once auth is ready.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  const inPostDetail = segments[0] === 'post';
  const inProviderProfile = segments[0] === 'provider';
  const inProviderReviews = inProviderProfile && segments[2] === 'reviews';
  const inProviderReviewForm = inProviderProfile && segments[2] === 'review';
  const inChat = segments[0] === 'chat';
  const inNotifications = segments[0] === 'notifications';
  const inServiceStatus = String(segments[0]) === 'service-status';
  const inServiceRequestDetail = String(segments[0]) === 'service-request';
  const inCategoryDetail = String(segments[0]) === 'category';
  const inEditInfo = segments[0] === 'edit-info';
  const inNewPost = segments[0] === 'new-post';
  const inPhotoSetup = segments[0] === '(auth)' && segments[1] === 'photo-setup';
  const inIndex = (segments as string[]).length === 0 || (segments as string[])[0] === 'index';
  const managesOwnChrome = inPostDetail;

  // Sync Android navigation bar with theme (post detail manages its own chrome).
  useEffect(() => {
    if (Platform.OS === 'android' && !managesOwnChrome) {
      void applyThemeSystemChrome(colorScheme === 'dark');
    }
  }, [colorScheme, managesOwnChrome, segments]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSettings = segments[0] === 'settings';

    const inChangePassword = segments[0] === 'change-password';
    const inResetPassword = segments[0] === 'reset-password';

    if (isAuthenticated && isFirstLoginSession && !inPhotoSetup) {
      runGuardedNavigation('replace:/(auth)/photo-setup', () => {
        router.replace('/(auth)/photo-setup' as any);
      });
    } else if (
      isAuthenticated &&
      hasCompletedOnboarding &&
      !inIndex &&
      !inTabsGroup &&
      !inSettings &&
      !inEditInfo &&
      !inNewPost &&
      !inPostDetail &&
      !inProviderProfile &&
      !inProviderReviews &&
      !inProviderReviewForm &&
      !inChat &&
      !inNotifications &&
      !inServiceStatus &&
      !inServiceRequestDetail &&
      !inCategoryDetail &&
      !inChangePassword &&
      !inResetPassword
    ) {
      runGuardedNavigation('replace:/(tabs)/market', () => {
        router.replace('/(tabs)/market' as any);
      });
    } else if (
      !isAuthenticated &&
      (inTabsGroup ||
        inSettings ||
        inEditInfo ||
        inNewPost ||
        inPostDetail ||
        inProviderProfile ||
        inProviderReviews ||
        inProviderReviewForm ||
        inChat ||
        inNotifications ||
        inServiceStatus ||
        inServiceRequestDetail ||
        inCategoryDetail ||
        inChangePassword ||
        inResetPassword)
    ) {
      runGuardedNavigation('replace:/(auth)/login', () => {
        router.replace('/(auth)/login' as any);
      });
    }
  }, [
    isAuthenticated,
    isFirstLoginSession,
    hasCompletedOnboarding,
    segments,
    isLoading,
    inPostDetail,
    inProviderProfile,
    inProviderReviews,
    inProviderReviewForm,
    inChat,
    inNotifications,
    inServiceStatus,
    inCategoryDetail,
    inEditInfo,
    inNewPost,
    inPhotoSetup,
  ]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="change-password" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="reset-password" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="edit-info" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="new-post" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="post/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="provider/[username]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="provider/[username]/reviews"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="provider/[username]/review"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen name="chat/[username]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="service-status" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="service-request/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="category" options={{ animation: 'slide_from_right' }} />
        </Stack>
        {!managesOwnChrome ? (
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        ) : null}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
