import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks';
import { useChatStore, useAuthStore } from '../../store';

/**
 * Base height of the tab bar content (icons + labels) before safe-area padding.
 * Android Material guidelines use 56; iOS HIG uses 49.
 */
const TAB_BAR_BASE_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const tabBarBg = isDark ? '#111113' : '#FFFFFF';
  const tabBarBorder = isDark ? '#1E1E21' : '#F0F0F2';

  // Use the raw inset value directly. In edge-to-edge mode, the system nav
  // bar overlaps the content and `insets.bottom` tells us how much space the
  // gesture handle / nav buttons occupy. On fresh launch the value may be 0
  // momentarily — that's fine because `position: 'absolute'` + `bottom: 0`
  // keeps the bar visually pinned regardless. Using a hardcoded fallback here
  // was the original bug: it inflated the height before the real inset arrived.
  const bottomPadding = insets.bottom;

  const { conversations } = useChatStore();
  const { user: currentUser } = useAuthStore();

  const unreadCount = conversations.filter(
    (c) => !c.lastMessage.isRead && c.lastMessage.receiverId === currentUser?.id
  ).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: {
          // ── Pin strictly to the bottom edge ──
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          // ── Sizing ──
          height: TAB_BAR_BASE_HEIGHT + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          // ── Appearance ──
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
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
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primary,
            color: '#FFFFFF',
            fontSize: 10,
          },
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
