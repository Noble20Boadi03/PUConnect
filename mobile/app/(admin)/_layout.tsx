import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminThemeColor } from '../../hooks';
import { TAB_BAR_BASE_HEIGHT } from '../../constants';
import { useAuthStore } from '../../store';
import { canAccessSection } from '../../hooks/useAdminPermissions';

export default function AdminTabsLayout() {
  const colorScheme = useColorScheme();
  const Colors = useAdminThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/(tabs)/market' as any);
    }
  }, [user]);

  const tier = user?.adminTier;
  const showDashboard = canAccessSection(tier, 'dashboard');
  const showModeration = canAccessSection(tier, 'moderation');
  const showDirectory = canAccessSection(tier, 'directory');
  const showContent = canAccessSection(tier, 'content');

  const tabBarBg = isDark ? '#111113' : '#FFFFFF';
  const tabBarBorder = isDark ? '#1E1E21' : '#F0F0F2';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          href: showDashboard ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="moderation"
        options={{
          title: 'Moderation',
          href: showModeration ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          title: 'Directory',
          href: showDirectory ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          title: 'Content',
          href: showContent ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
