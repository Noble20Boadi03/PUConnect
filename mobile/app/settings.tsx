import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAppAlert } from '@/context/alert-context';
import { useResponsive } from '@/hooks/use-responsive';

export default function SettingsScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();
  const insets = useSafeAreaInsets();
  const { theme, isDark, setMode } = useTheme();
  const { contentPaddingLeft, contentPaddingRight } = useResponsive();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ThemedIcon name="chevron-left" size={28} />
        </Pressable>
        <ThemedText variant="headlineSmall" style={styles.headerTitle}>
          Settings
        </ThemedText>
        <View style={{ width: 40 }} />
      </ThemedView>

      <ScrollView
        contentContainerStyle={[styles.scroll, horizontalPadding, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="titleMedium" style={styles.sectionLabel}>
          Appearance
        </ThemedText>
        <ThemedView style={[styles.row, { borderColor: theme.outlineVariant, backgroundColor: theme.surface }]}>
          <ThemedText variant="bodyLarge">Dark mode</ThemedText>
          <Switch
            value={isDark}
            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
            trackColor={{ false: theme.outlineVariant, true: theme.primaryContainer }}
          />
        </ThemedView>

        <ThemedText variant="titleMedium" style={styles.sectionLabel}>
          Notifications (demo)
        </ThemedText>
        <ThemedView style={[styles.row, { borderColor: theme.outlineVariant, backgroundColor: theme.surface }]}>
          <ThemedText variant="bodyLarge">Push notifications</ThemedText>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </ThemedView>
        <ThemedView style={[styles.row, { borderColor: theme.outlineVariant, backgroundColor: theme.surface }]}>
          <ThemedText variant="bodyLarge">Weekly digest email</ThemedText>
          <Switch value={emailDigest} onValueChange={setEmailDigest} />
        </ThemedView>

        <ThemedText variant="titleMedium" style={styles.sectionLabel}>
          Account
        </ThemedText>
        <Pressable
          onPress={() =>
            showAlert({
              title: 'Password reset',
              subtitle: 'If this were production, we would email a reset link to your university address.',
              severity: 'info'
            })
          }
        >
          <ThemedView style={[styles.row, { borderColor: theme.outlineVariant, backgroundColor: theme.surface }]}>
            <ThemedText variant="bodyLarge">Forgot password</ThemedText>
            <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
          </ThemedView>
        </Pressable>

        <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginTop: Spacing.lg }}>
          PuConnect {Platform.OS} · MVP settings placeholder
        </ThemedText>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontWeight: '800' },
  scroll: { paddingTop: Spacing.sm },
  sectionLabel: { fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
