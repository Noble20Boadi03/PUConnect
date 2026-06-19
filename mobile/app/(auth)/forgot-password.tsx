import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppRouter, useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button, Alert, KeyboardLayout } from '../../components';
import { authService } from '../../services';

export default function ForgotPasswordScreen() {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();

  const screenBg = colorScheme === 'dark' ? '#09090B' : '#F4F4F5';
  const cardBg = colorScheme === 'dark' ? '#18181B' : '#FFFFFF';

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<boolean>(false);

  const handleBack = () => {
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login' as any);
    }
  };

  const handleSendResetLink = async () => {
    if (!emailOrUsername.trim()) {
      setErrorMsg('Please enter your email or username.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    

    try {
      const response = await authService.forgotPassword(emailOrUsername.trim());
      setSuccessMsg(response.message ?? null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to reset password screen after short delay
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { emailOrUsername: emailOrUsername.trim() }
        });
      }, 1500);
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
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
              <Text style={[styles.title, { color: Colors.primary }]}>Forgot password?</Text>
              <Text style={[styles.subtitle, { color: Colors.text }]}>
                No worries, we'll send you a reset link to get back in!
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
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>Email or Username</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: screenBg,
                  borderColor: focusedInput ? Colors.primary : Colors.border
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: Colors.text }]}
                  placeholder="Enter your email or username"
                  placeholderTextColor={Colors.icon + '80'}
                  keyboardType="default"
                  autoCapitalize="none"
                  value={emailOrUsername}
                  onChangeText={setEmailOrUsername}
                  onFocus={() => setFocusedInput(true)}
                  onBlur={() => setFocusedInput(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleSendResetLink}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <Button
                title="Send Reset Link"
                variant="primary"
                size="md"
                onPress={handleSendResetLink}
                style={styles.mainButton}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              />

              <Button
                title="Back to Login"
                variant="ghost"
                size="sm"
                onPress={() => {
                  
                  router.push('/(auth)/login' as any);
                }}
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
    marginBottom: Spacing.lg,
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
  actionsContainer: {
    gap: Spacing.sm,
  },
  mainButton: {
    width: '100%',
    borderRadius: 10,
  },
});
