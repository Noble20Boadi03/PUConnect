import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store';
import { initializeThemePreference } from '../lib/themePreference';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';

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

  // Sync System Navigation Bar on Android with the theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      const isDark = colorScheme === 'dark';
      // Set style of navigation bar buttons (dark buttons on light bg, light buttons on dark bg)
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
  }, [colorScheme]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSettings = segments[0] === 'settings';

    if (isAuthenticated && !inTabsGroup && !inSettings) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        router.replace('/(tabs)/market' as any);
      }
    } else if (!isAuthenticated && (inTabsGroup || inSettings)) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        router.replace('/(auth)/login' as any);
      }
    } else {
      didRedirectRef.current = false;
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
