import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button } from '../../components';

export default function LoginScreen() {
  const router = useRouter();
  const { registered, username } = useLocalSearchParams();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  
  const screenBg = colorScheme === 'dark' ? '#09090B' : '#F4F4F5';
  const cardBg = colorScheme === 'dark' ? '#18181B' : '#FFFFFF';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (registered === 'true') {
      setShowSuccessAlert(true);
    }
  }, [registered]);

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Authentication logic
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
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
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
              <Animated.View 
                entering={FadeInDown.duration(400).springify()}
                exiting={FadeOut.duration(300)}
                style={[
                  styles.successBanner, 
                  { 
                    backgroundColor: Colors.primary + '15', 
                    borderColor: Colors.primary,
                  }
                ]}
              >
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
                <View style={styles.successTextContainer}>
                  <Text style={[styles.successBannerTitle, { color: Colors.text }]}>
                    Registration Complete
                  </Text>
                  <Text style={[styles.successBannerSubtitle, { color: Colors.text + 'CC' }]}>
                    {username ? `Welcome @${username}! ` : 'Welcome aboard! '}Your campus account is ready. Please log in to access your profile.
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowSuccessAlert(false);
                  }}
                  style={styles.closeAlertButton}
                >
                  <Ionicons name="close" size={16} color={Colors.icon} />
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: Colors.icon }]}>Email</Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: screenBg, 
                    borderColor: focusedInput === 'email' ? Colors.primary : Colors.border 
                  }
                ]}>
                  <TextInput
                    style={[styles.input, { color: Colors.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.icon + '80'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
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

        </ScrollView>
      </KeyboardAvoidingView>
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  successTextContainer: {
    flex: 1,
  },
  successBannerTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  successBannerSubtitle: {
    fontSize: Typography.size.xs,
    lineHeight: 16,
  },
  closeAlertButton: {
    padding: 2,
  },
});
