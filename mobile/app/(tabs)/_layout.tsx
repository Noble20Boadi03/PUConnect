import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const tabBarBg = isDark ? '#111113' : '#FFFFFF';
  const tabBarBorder = isDark ? '#1E1E21' : '#F0F0F2';

  // Dynamically compute safe height and padding for Edge-to-Edge navigation bars
  const paddingBottom = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarHeight = Platform.OS === 'ios' ? 49 + paddingBottom : 56 + paddingBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: paddingBottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
