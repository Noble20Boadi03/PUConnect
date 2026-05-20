import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button } from '../../components';

export default function LoginScreen() {
  const router = useRouter();
  const Colors = useThemeColor();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Authentication logic goes here
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: Colors.border + '40' }]} 
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Title Area */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: Colors.primary }]}>Login here</Text>
            <Text style={[styles.subtitle, { color: Colors.text }]}>
              Welcome back you've been missed!
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>Email</Text>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: Colors.background, 
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

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: Colors.icon }]}>Password</Text>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: Colors.background, 
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
                    size={22} 
                    color={Colors.icon} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[styles.forgotPasswordText, { color: Colors.primary }]}>
                Forgot Password
              </Text>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Button 
                title="Sign In" 
                variant="primary" 
                size="lg" 
                onPress={handleSignIn} 
                style={styles.mainButton}
              />
              
              <Button 
                title="Create new account" 
                variant="ghost" 
                size="md" 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // router.push('/(auth)/register');
                }} 
              />
            </View>
          </View>

          {/* Footer - Admin Login */}
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingVertical: Spacing.md,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.size.title,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.lg,
    fontWeight: '500',
    lineHeight: 28,
  },
  formContainer: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.md,
    height: '100%',
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  forgotPasswordText: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  mainButton: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  adminLoginText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
