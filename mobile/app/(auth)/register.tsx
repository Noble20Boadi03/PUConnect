import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button } from '../../components';
import Animated, { FadeIn, FadeOut, FadeInDown } from 'react-native-reanimated';

export default function RegisterScreen() {
  const router = useRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  
  const screenBg = colorScheme === 'dark' ? '#09090B' : '#F4F4F5';
  const cardBg = colorScheme === 'dark' ? '#18181B' : '#FFFFFF';
  
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Complete Account Creation (Testing flow: return to login)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/(auth)/login',
        params: { registered: 'true', username: username }
      } as any);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(auth)/login' as any);
      }
    }
  };

  const getTitle = () => {
    if (step === 1) return 'Create Account';
    if (step === 2) return 'Secure Account';
    return 'Final Step';
  };

  const getSubtitle = () => {
    if (step === 1) return 'Join us and start building your campus network!';
    if (step === 2) return 'Choose a strong password to protect your profile.';
    return 'Pick a unique username for your public profile.';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: cardBg }]} 
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Card */}
          <Animated.View 
            entering={FadeInDown.delay(150).duration(500).springify()}
            style={[styles.card, { backgroundColor: cardBg }]}
          >
            
            {/* Title Area */}
            <View style={styles.titleContainer}>
              <Animated.View
                key={`title-${step}`}
                entering={FadeIn.delay(50).duration(300)}
              >
                <Text style={[styles.title, { color: Colors.primary }]}>
                  {getTitle()}
                </Text>
              </Animated.View>
              
              <Animated.View
                key={`subtitle-${step}`}
                entering={FadeIn.delay(100).duration(300)}
              >
                <Text style={[styles.subtitle, { color: Colors.text }]}>
                  {getSubtitle()}
                </Text>
              </Animated.View>
              
              {/* Wizard Step Indicator */}
              <View style={styles.stepIndicatorContainer}>
                <View style={[styles.stepBar, step === 1 ? styles.stepBarActive : null, { backgroundColor: step === 1 ? Colors.primary : Colors.border }]} />
                <View style={[styles.stepBar, step === 2 ? styles.stepBarActive : null, { backgroundColor: step === 2 ? Colors.primary : Colors.border }]} />
                <View style={[styles.stepBar, step === 3 ? styles.stepBarActive : null, { backgroundColor: step === 3 ? Colors.primary : Colors.border }]} />
              </View>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              
              {step === 1 && (
                <Animated.View
                  key="step-1-inputs"
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(200)}
                >
                  {/* First Name Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: Colors.icon }]}>First Name</Text>
                    <View style={[
                      styles.inputContainer, 
                      { 
                        backgroundColor: screenBg, 
                        borderColor: focusedInput === 'firstName' ? Colors.primary : Colors.border 
                      }
                    ]}>
                      <TextInput
                        style={[styles.input, { color: Colors.text }]}
                        placeholder="Enter first name"
                        placeholderTextColor={Colors.icon + '80'}
                        value={firstName}
                        onChangeText={setFirstName}
                        onFocus={() => setFocusedInput('firstName')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  {/* Last Name Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: Colors.icon }]}>Last Name</Text>
                    <View style={[
                      styles.inputContainer, 
                      { 
                        backgroundColor: screenBg, 
                        borderColor: focusedInput === 'lastName' ? Colors.primary : Colors.border 
                      }
                    ]}>
                      <TextInput
                        style={[styles.input, { color: Colors.text }]}
                        placeholder="Enter last name"
                        placeholderTextColor={Colors.icon + '80'}
                        value={lastName}
                        onChangeText={setLastName}
                        onFocus={() => setFocusedInput('lastName')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  {/* Email Input */}
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
                </Animated.View>
              )}

              {step === 2 && (
                <Animated.View
                  key="step-2-inputs"
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(200)}
                >
                  {/* Password Input */}
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
                        placeholder="Enter password"
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

                  {/* Confirm Password Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: Colors.icon }]}>Confirm Password</Text>
                    <View style={[
                      styles.inputContainer, 
                      { 
                        backgroundColor: screenBg, 
                        borderColor: focusedInput === 'confirmPassword' ? Colors.primary : Colors.border 
                      }
                    ]}>
                      <TextInput
                        style={[styles.input, { color: Colors.text }]}
                        placeholder="Confirm password"
                        placeholderTextColor={Colors.icon + '80'}
                        secureTextEntry={!isConfirmPasswordVisible}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedInput('confirmPassword')}
                        onBlur={() => setFocusedInput(null)}
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
                </Animated.View>
              )}

              {step === 3 && (
                <Animated.View
                  key="step-3-inputs"
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(200)}
                >
                  {/* Username Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: Colors.icon }]}>Username</Text>
                    <View style={[
                      styles.inputContainer, 
                      { 
                        backgroundColor: screenBg, 
                        borderColor: focusedInput === 'username' ? Colors.primary : Colors.border 
                      }
                    ]}>
                      <TextInput
                        style={[styles.input, { color: Colors.text }]}
                        placeholder="Choose a username"
                        placeholderTextColor={Colors.icon + '80'}
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <Button 
                  title={step === 3 ? "Create Account" : "Continue"} 
                  variant="primary" 
                  size="md" 
                  onPress={handleContinue} 
                  style={styles.mainButton}
                />
                
                <TouchableOpacity 
                  style={styles.loginLink}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(auth)/login' as any);
                  }}
                >
                  <Text style={[styles.loginLinkText, { color: Colors.primary }]}>
                    Login to existing account
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </Animated.View>

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
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  stepBar: {
    height: 4,
    width: 24,
    borderRadius: 2,
  },
  stepBarActive: {
    width: 32,
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
  actionsContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
  },
  mainButton: {
    width: '100%',
    borderRadius: 10,
  },
  loginLink: {
    paddingVertical: Spacing.xs,
  },
  loginLinkText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
