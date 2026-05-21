import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { useAppRouter, useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button, Alert, KeyboardLayout } from '../../components';
import { LoginSearchParams, LoginFormInput } from '../../types';
import { useAuthStore } from '../../store';
import { authService } from '../../services';

export default function LoginScreen() {
  const router = useAppRouter();
  const { registered, username } = useLocalSearchParams() as unknown as LoginSearchParams;
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  
  const screenBg = colorScheme === 'dark' ? '#09090B' : '#F4F4F5';
  const cardBg = colorScheme === 'dark' ? '#18181B' : '#FFFFFF';
  
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<LoginFormInput | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const passwordInputRef = useRef<TextInput>(null);
  
  const { login } = useAuthStore();

  useEffect(() => {
    if (registered === 'true') {
      setShowSuccessAlert(true);
    }
  }, [registered]);

  const handleSignIn = async () => {
    if (!emailOrUsername.trim() || !password) {
      setErrorMsg('Please fill in all fields.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setErrorMsg(null);
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const response = await authService.login({ emailOrUsername: emailOrUsername.trim(), password });
      await login(response.user, response.token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Login Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg(error.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: '/', params: { slide: 'last', skipSplash: 'true' } } as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      <KeyboardLayout contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: cardBg }]} 
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: Colors.primary }]}>Login here</Text>
              <Text style={[styles.subtitle, { color: Colors.text }]}>
                Welcome back you've been missed!
              </Text>
            </View>

            {showSuccessAlert && (
              <Alert
                type="success"
                title="Registration Complete"
                message={username ? `Welcome @${username}! Your campus account is ready. Please log in to access your profile.` : 'Welcome aboard! Your campus account is ready. Please log in to access your profile.'}
                dismissible
                onDismiss={() => setShowSuccessAlert(false)}
              />
            )}

            <View style={styles.formContainer}>
              {errorMsg && (
                <Alert
                  type="error"
                  message={errorMsg}
                />
              )}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: Colors.icon }]}>Email or Username</Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: screenBg, 
                    borderColor: focusedInput === 'emailOrUsername' ? Colors.primary : Colors.border 
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
                    onFocus={() => setFocusedInput('emailOrUsername')}
                    onBlur={() => setFocusedInput(null)}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: Colors.icon }]}>Password</Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: screenBg, 
                    borderColor: focusedInput === 'password' ? Colors.primary : Colors.border 
                  }
                ]}>
                  <TextInput
                    style={[styles.input, { color: Colors.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.icon + '80'}
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    ref={passwordInputRef}
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
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

              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={[styles.forgotPasswordText, { color: Colors.primary }]}>
                  Forgot Password
                </Text>
              </TouchableOpacity>

              <View style={styles.actionsContainer}>
                <Button 
                  title="Sign In" 
                  variant="primary" 
                  size="md" 
                  onPress={handleSignIn} 
                  style={styles.mainButton}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                />
                
                <Button 
                  title="Create new account" 
                  variant="ghost" 
                  size="sm" 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(auth)/register' as any);
                  }} 
                />
              </View>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity 
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[styles.adminLoginText, { color: Colors.icon }]}>
                Admin Login (Testing)
              </Text>
            </TouchableOpacity>
          </View>

        </KeyboardLayout>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
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
  formContainer: {
    flex: 1,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: Spacing.sm,
  },
  mainButton: {
    width: '100%',
    borderRadius: 10,
  },
  footerContainer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  adminLoginText: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
