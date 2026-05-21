import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store';
import { initializeThemePreference } from '../lib/themePreference';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { applyThemeSystemChrome } from '../lib/systemChrome';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const didRedirectRef = useRef(false);

  useEffect(() => {
    initialize();
    initializeThemePreference();
  }, []);

  // Authenticated users skip the landing page — hide splash once auth is ready.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  const inPostDetail = segments[0] === 'post';

  // Sync Android navigation bar with theme (post detail manages its own chrome).
  useEffect(() => {
    if (Platform.OS === 'android' && !inPostDetail) {
      void applyThemeSystemChrome(colorScheme === 'dark');
    }
  }, [colorScheme, inPostDetail]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSettings = segments[0] === 'settings';
    if (isAuthenticated && !inTabsGroup && !inSettings && !inPostDetail) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        router.replace('/(tabs)/market' as any);
      }
    } else if (!isAuthenticated && (inTabsGroup || inSettings || inPostDetail)) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        router.replace('/(auth)/login' as any);
      }
    } else {
      didRedirectRef.current = false;
    }
  }, [isAuthenticated, segments, isLoading, inPostDetail]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="post/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
      {!inPostDetail ? (
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      ) : null}
    </ThemeProvider>
  );
}
