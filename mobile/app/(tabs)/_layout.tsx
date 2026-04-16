import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '@/context/theme-context';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useResponsive } from '@/hooks/use-responsive';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsive();

  // In landscape, reduce tab bar height to preserve vertical screen space.
  // The tab bar also needs side (left/right) inset padding on phones in landscape.
  const tabBarHeight = isLandscape
    ? (Platform.OS === 'ios' ? 48 : 46) + insets.bottom
    : (Platform.OS === 'ios' ? 64 : 62) + insets.bottom;

  const tabBarPaddingBottom = isLandscape
    ? insets.bottom + 4
    : insets.bottom + 8;

  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        headerShown: false,
        tabBarStyle: {
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
          borderTopWidth: 0,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: isLandscape ? 4 : 8,
          // In landscape add side insets for the home-indicator / notch
          paddingLeft: isLandscape ? insets.left : 0,
          paddingRight: isLandscape ? insets.right : 0,
          backgroundColor: isDark ? 'rgba(26, 28, 30, 0.9)' : 'rgba(253, 251, 255, 0.9)',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name={focused ? "briefcase" : "briefcase-outline"} 
              size={24} 
              lightColor={color} 
              darkColor={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name={focused ? "chat" : "chat-outline"} 
              size={24} 
              lightColor={color} 
              darkColor={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name={focused ? "magnify" : "magnify"} 
              size={26} 
              lightColor={color} 
              darkColor={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon 
              name={focused ? "account" : "account-outline"} 
              size={24} 
              lightColor={color} 
              darkColor={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
          title: 'Setup',
        }}
      />
    </Tabs>
  );
}
