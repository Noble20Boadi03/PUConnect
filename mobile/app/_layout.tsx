import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isDark, theme } = useTheme();

  useEffect(() => {
    // 1. Sync Native Root Background Color (prevents white flashes during navigation)
    SystemUI.setBackgroundColorAsync(theme.background);

    // 2. Sync Android Navigation Bar
    if (Platform.OS === 'android') {
      // Set the button style (light icons for dark theme, dark icons for light theme)
      NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
      
      // Optional: Set background color if not using full edge-to-edge transparency,
      // or to ensure the nav bar background matches the app theme.
      NavigationBar.setBackgroundColorAsync(theme.background);
    }
  }, [isDark, theme.background]);

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} animated={true} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
