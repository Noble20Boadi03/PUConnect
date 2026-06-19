import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppRouter, useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button, Alert, KeyboardLayout } from '../../components';
import { authService } from '../../services';

export default function ResetPasswordScreen() {
  const router = useAppRouter();
  const { emailOrUsername } = useLocalSearchParams<{ emailOrUsername: string }>();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();

  const screenBg = colorScheme === 'dark' ? '#09090B' : '#F4F4F5';
  const cardBg = colorScheme === 'dark' ? '#18181B' : '#FFFFFF';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'otp' | 'new' | 'confirm' | null>(null);
  
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleBack = () => {
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login' as any);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (otp.length !== 6) {
      setErrorMsg('OTP must be 6 digits.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!emailOrUsername) {
      setErrorMsg('Missing email or username.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    

    try {
      const response = await authService.resetPassword(emailOrUsername, otp, newPassword, confirmPassword);
      setSuccessMsg(response.message ?? null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Redirect to login after short delay
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 2000);
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!emailOrUsername) return;
    
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    

    try {
      const response = await authService.forgotPassword(emailOrUsername);
      setSuccessMsg(response.message ?? null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: cardBg }]}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardLayout style={styles.keyboard} contentContainerStyle={styles.scrollContent}>
        <View style={styles.centeredBody}>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: Colors.primary }]}>Reset Password</Text>
              <Text style={[styles.subtitle, { color: Colors.text }]}>
                Enter the OTP sent to your email and create a new password
              </Text>
            </View>

            {successMsg && (
              <Alert
                type="success"
                message={successMsg}
                onDismiss={() => setSuccessMsg(null)}
              />
            )}

            {errorMsg && (
              <Alert
                type="error"
                message={errorMsg}
                onDismiss={() => setErrorMsg(null)}
              />
            )}

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>OTP Code</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: screenBg,
                  borderColor: focusedInput === 'otp' ? Colors.primary : Colors.border
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: Colors.text, letterSpacing: 8, fontSize: 20 }]}
                  placeholder="000000"
                  placeholderTextColor={Colors.icon + '80'}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  onFocus={() => setFocusedInput('otp')}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => newPasswordInputRef.current?.focus()}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>New Password</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: screenBg,
                  borderColor: focusedInput === 'new' ? Colors.primary : Colors.border
                }
              ]}>
                <TextInput
                  ref={newPasswordInputRef}
                  style={[styles.input, { color: Colors.text }]}
                  placeholder="Enter your new password"
                  placeholderTextColor={Colors.icon + '80'}
                  secureTextEntry={!isPasswordVisible}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setFocusedInput('new')}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>Confirm Password</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: screenBg,
                  borderColor: focusedInput === 'confirm' ? Colors.primary : Colors.border
                }
              ]}>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={[styles.input, { color: Colors.text }]}
                  placeholder="Confirm your new password"
                  placeholderTextColor={Colors.icon + '80'}
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedInput('confirm')}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <Button
                title="Reset Password"
                variant="primary"
                size="md"
                onPress={handleResetPassword}
                style={styles.mainButton}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button
                title="Resend OTP"
                variant="ghost"
                size="sm"
                onPress={handleResendOTP}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </KeyboardLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  centeredBody: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '400',
  },
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.sm,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  actionsContainer: {
    gap: Spacing.sm,
  },
  mainButton: {
    width: '100%',
    borderRadius: 10,
  },
});
