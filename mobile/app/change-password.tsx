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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppRouter, useThemeColor } from '../hooks';
import { Spacing, Typography } from '../constants';
import { Button, Alert, KeyboardLayout } from '../components';
import { authService } from '../services';

export default function ChangePasswordScreen() {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();

  const screenBg = colorScheme === 'dark' ? '#09090B' : '#F4F4F5';
  const cardBg = colorScheme === 'dark' ? '#18181B' : '#FFFFFF';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'current' | 'new' | 'confirm' | null>(null);

  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleBack = () => {
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile' as any);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg('Please fill in all fields.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    

    try {
      const response = await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      setSuccessMsg(response.message ?? null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Clear inputs and navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error('Change Password Error:', error);
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
        <Text style={[styles.title, { color: Colors.text }]}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardLayout style={styles.keyboard} contentContainerStyle={styles.scrollContent}>
        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            {successMsg && (
              <Alert
                type="success"
                message={successMsg}
              />
            )}

            {errorMsg && (
              <Alert
                type="error"
                message={errorMsg}
              />
            )}

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>Current Password</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: screenBg,
                  borderColor: focusedInput === 'current' ? Colors.primary : Colors.border
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: Colors.text }]}
                  placeholder="Enter your current password"
                  placeholderTextColor={Colors.icon + '80'}
                  secureTextEntry={!isCurrentPasswordVisible}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  onFocus={() => setFocusedInput('current')}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => newPasswordInputRef.current?.focus()}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isCurrentPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.icon}
                  />
                </TouchableOpacity>
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
                  secureTextEntry={!isNewPasswordVisible}
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
                  onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>Confirm New Password</Text>
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
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  onFocus={() => setFocusedInput('confirm')}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
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

            <Button
              title="Update Password"
              variant="primary"
              size="md"
              onPress={handleChangePassword}
              style={styles.updateButton}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            />
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
  body: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    borderRadius: 12,
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
  updateButton: {
    marginTop: Spacing.lg,
    width: '100%',
    borderRadius: 12,
  },
});
