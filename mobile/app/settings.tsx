import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { PasswordResetModal } from '@/components/ui/password-reset-modal';

import { useAuth } from '@/context/auth-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const insets = useSafeAreaInsets();
  const { theme, isDark, setMode } = useTheme();
  const { horizontalPadding } = useResponsive();

  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Settings" />

      <ScrollView
        contentContainerStyle={[styles.scroll, horizontalPadding, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText variant="labelLarge" colorName="textMuted" style={styles.sectionLabel}>
            APPEARANCE
          </ThemedText>
          <ThemedView style={[styles.groupedMenu, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
            <View style={styles.menuItem}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryContainer }]}>
                <ThemedIcon name={isDark ? "moon-waning-crescent" : "white-balance-sunny"} size={20} colorName="onPrimaryContainer" />
              </View>
              <ThemedText variant="titleMedium" style={styles.menuText}>Dark Mode</ThemedText>
              <Switch
                value={isDark}
                onValueChange={(v) => setMode(v ? 'dark' : 'light')}
                trackColor={{ false: theme.outlineVariant, true: theme.primary }}
              />
            </View>
          </ThemedView>
        </View>



        <View style={styles.section}>
          <ThemedText variant="labelLarge" colorName="textMuted" style={styles.sectionLabel}>
            ACCOUNT
          </ThemedText>
          <ThemedView style={[styles.groupedMenu, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
            <Pressable
              onPress={() => setIsResetModalVisible(true)}
              style={styles.menuItem}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.surfaceVariant }]}>
                <ThemedIcon name="lock-reset" size={20} colorName="text" />
              </View>
              <ThemedText variant="titleMedium" style={styles.menuText}>Reset Password</ThemedText>
              <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
            </Pressable>
          </ThemedView>
        </View>

        <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.logoutWrapper}>
           <Pressable
             style={[styles.logoutBtn, { borderColor: theme.error, backgroundColor: theme.errorContainer + '20' }]}
             onPress={async () => {
               await signOut();
               router.replace('/');
             }}
           >
             <ThemedIcon name="logout" size={20} colorName="error" />
             <ThemedText variant="titleMedium" colorName="error" style={{ fontWeight: '700' }}>Log Out</ThemedText>
           </Pressable>
           <ThemedText variant="labelSmall" colorName="textMuted" align="center" style={{ marginTop: Spacing.lg }}>
             PuConnect {Platform.OS} · Version 1.0.4 (MVP)
           </ThemedText>
        </Animated.View>
      </ScrollView>
      <PasswordResetModal
        isVisible={isResetModalVisible}
        onClose={() => setIsResetModalVisible(false)}
        initialEmail={user?.email}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({

  scroll: { paddingTop: Spacing.sm },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    marginLeft: 4,
    opacity: 0.6,
  },
  groupedMenu: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  menuText: {
    flex: 1,
    fontWeight: '600',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.1)',
    marginHorizontal: Spacing.lg,
  },
  logoutWrapper: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  logoutBtn: {
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
