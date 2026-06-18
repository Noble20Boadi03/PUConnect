import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

import { useAppRouter, useThemeColor, useLogout, useDeleteAccount, useAuth } from '../hooks';
import { Spacing, Typography } from '../constants';
import { Alert, ConfirmDialog } from '../components';
import { authService } from '../services';

export default function SettingsScreen() {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const { user } = useAuth();
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const {
    isLoading: isLoggingOut,
    error: logoutError,
    confirmVisible: logoutConfirmVisible,
    openLogoutDialog,
    closeLogoutDialog,
    confirmLogout,
    clearError: clearLogoutError,
  } = useLogout();

  const {
    isLoading: isDeletingAccount,
    error: deleteAccountError,
    confirmVisible: deleteAccountConfirmVisible,
    openDeleteAccountDialog,
    closeDeleteAccountDialog,
    confirmDeleteAccount,
    clearError: clearDeleteAccountError,
  } = useDeleteAccount();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const platformLabel = Platform.OS === 'ios' ? 'ios' : 'android';

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile' as any);
    }
  };

  const handleResetPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOtpError(null);
    setResetConfirmVisible(true);
  };

  const closeResetConfirm = () => {
    if (isSendingOTP) return;
    setResetConfirmVisible(false);
  };

  const confirmResetPassword = async () => {
    const emailOrUsername = user?.email || user?.username;
    if (!emailOrUsername) {
      setOtpError('No email or username found for the user.');
      setResetConfirmVisible(false);
      return;
    }

    setIsSendingOTP(true);
    setOtpError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await authService.forgotPassword(emailOrUsername);
      setIsSendingOTP(false);
      setResetConfirmVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to reset password page, passing email
      router.push({
        pathname: '/reset-password',
        params: { emailOrUsername }
      });
    } catch (err: any) {
      console.error('Settings Send OTP Error:', err);
      setIsSendingOTP(false);
      setResetConfirmVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setOtpError(err.response?.data?.message || 'Failed to send reset OTP. Please try again.');
    }
  };

  const error = logoutError || deleteAccountError || otpError;
  const clearError = () => {
    clearLogoutError();
    clearDeleteAccountError();
    setOtpError(null);
  };
  const isLoading = isLoggingOut || isDeletingAccount || isSendingOTP;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Log Out"
        message="Are you sure you want to sign out of PuConnect?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isLoggingOut}
        onConfirm={confirmLogout}
        onCancel={closeLogoutDialog}
      />
      <ConfirmDialog
        visible={deleteAccountConfirmVisible}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeletingAccount}
        onConfirm={confirmDeleteAccount}
        onCancel={closeDeleteAccountDialog}
      />
      <ConfirmDialog
        visible={resetConfirmVisible}
        title="Reset Password"
        message={`We will send a 6-digit OTP code to your registered email (${user?.email || ''}) to reset your password. You will stay signed in on this device.`}
        confirmLabel="Send OTP"
        cancelLabel="Cancel"
        variant="default"
        isLoading={isSendingOTP}
        onConfirm={confirmResetPassword}
        onCancel={closeResetConfirm}
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/change-password');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIconCircle, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="key-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: Colors.text }]}>Change Password</Text>
              <Text style={[styles.rowSubtitle, { color: Colors.icon }]}>
                Update your current password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.icon} />
          </TouchableOpacity>
          
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
                Forgot your password? Reset via email
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
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          )}
          <Text style={[styles.logoutText, { color: Colors.error }]}>
            {isLoggingOut ? 'Signing out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            { borderColor: Colors.error + '35', opacity: isLoading ? 0.6 : 1, backgroundColor: Colors.error + '10' },
          ]}
          onPress={openDeleteAccountDialog}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isDeletingAccount ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          )}
          <Text style={[styles.deleteText, { color: Colors.error }]}>
            {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  deleteText: {
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
