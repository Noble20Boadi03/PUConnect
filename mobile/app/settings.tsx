import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

import { useThemeColor, useLogout } from '../hooks';
import { Spacing, Typography } from '../constants';
import { Alert, ConfirmDialog } from '../components';

export default function SettingsScreen() {
  const router = useRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const {
    isLoading,
    error,
    confirmVisible,
    openLogoutDialog,
    closeLogoutDialog,
    confirmLogout,
    clearError,
  } = useLogout();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const platformLabel = Platform.OS === 'ios' ? 'ios' : 'android';

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const handleResetPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <ConfirmDialog
        visible={confirmVisible}
        title="Log Out"
        message="Are you sure you want to sign out of PuConnect?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={confirmLogout}
        onCancel={closeLogoutDialog}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleResetPassword}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIconCircle, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: Colors.text }]}>Reset Password</Text>
              <Text style={[styles.rowSubtitle, { color: Colors.icon }]}>
                Change your security credentials
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.icon} />
          </TouchableOpacity>
        </View>

        {error && (
          <Alert
            type="error"
            message={error}
            dismissible
            onDismiss={clearError}
          />
        )}

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderColor: Colors.error + '35', opacity: isLoading ? 0.6 : 1 },
          ]}
          onPress={openLogoutDialog}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          )}
          <Text style={[styles.logoutText, { color: Colors.error }]}>
            {isLoading ? 'Signing out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: Colors.icon }]}>
          PuConnect {platformLabel} · Version {appVersion} (MVP)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  settingsCard: {
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md - 2,
    paddingVertical: Spacing.sm + 2,
  },
  rowIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: Spacing.xl,
  },
  logoutText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  versionText: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
});
