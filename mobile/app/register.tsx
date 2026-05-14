import React, { useState, useRef } from "react";
import {
    TextInput,
    StyleSheet,
    View,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";

import { router } from "expo-router";
import Animated, { FadeInDown, SlideInRight, SlideOutLeft, SlideInLeft, SlideOutRight } from "react-native-reanimated";
import { useAuth } from "@/context/auth-context";
import { useAppAlert } from "@/context/alert-context";
import { AnimatedInput } from "@/components/ui/animated-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { AuthBackground } from "@/components/ui/auth-background";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme-context";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";

const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

export default function RegisterScreen() {
    const { theme, isDark } = useTheme();
    const { register } = useAuth();
    const { showAlert } = useAppAlert();
    const { contentPaddingLeft, contentPaddingRight } = useResponsive();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
    });
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Keyboard accessibility references
    const lastNameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);
    const usernameRef = useRef<TextInput>(null);

    const insets = useSafeAreaInsets();

    const handleContinue = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleRegister = async () => {
        const { firstName, lastName, email, password, username } = formData;

        setIsLoading(true);
        try {
            await register({
                fullName: `${firstName} ${lastName}`.trim(),
                email,
                username,
                password,
                role: 'student',
            });

            showAlert({
                title: "Success",
                subtitle: "Account created successfully!",
                severity: "success",
                primaryButtonTitle: "Go to Home",
                onPrimaryPress: () => router.replace({ pathname: "/(tabs)/home" })
            });
        } catch (error) {
            console.error("Registration failed:", error);
            showAlert({ title: "Registration Failed", subtitle: "Could not create account.", severity: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <AuthBackground />
        <ScreenLayout transparent padding="none" keyboardAvoiding scrollable contentContainerStyle={horizontalPadding}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.content}>
                    {/* Dynamic Back Button */}
                    {step > 1 && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            <Pressable 
                                onPress={() => setStep((step - 1) as 1 | 2 | 3)} 
                                accessibilityRole="button"
                                accessibilityLabel="Go back"
                                style={[styles.backButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)', marginTop: insets.top + Spacing.sm }]}
                            >
                                <ThemedIcon name="chevron-left" size={24} lightColor="#ffffff" darkColor="#ffffff" />
                            </Pressable>
                        </Animated.View>
                    )}

                    <View style={[styles.header, step === 1 && { marginTop: insets.top + Spacing.xl }]}>
                        <AnimatedThemedText key={`title-${step}`} entering={FadeInDown.duration(400)} variant="headlineLarge" colorName="primary" style={styles.title}>
                            {step === 1 ? "Create Account" : step === 2 ? "Secure Account" : "Final Step"}
                        </AnimatedThemedText>
                        <AnimatedThemedText key={`sub-${step}`} entering={FadeInDown.delay(100).duration(400)} variant="titleLarge" style={styles.subtitle}>
                            {step === 1 ? "Join us and start building\nyour campus network!" : step === 2 ? "Choose a strong password\nto protect your profile." : "Pick a unique username\nfor your public profile."}
                        </AnimatedThemedText>
                        
                        {/* Step Indicator */}
                        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.stepIndicatorContainer}>
                            <View style={[styles.stepDot, { backgroundColor: step === 1 ? theme.primary : theme.surfaceVariant }]} />
                            <View style={[styles.stepDot, { backgroundColor: step === 2 ? theme.primary : theme.surfaceVariant }]} />
                            <View style={[styles.stepDot, { backgroundColor: step === 3 ? theme.primary : theme.surfaceVariant }]} />
                        </Animated.View>
                    </View>

                    <View style={styles.form}>
                        {step === 1 ? (
                            <Animated.View key="step1" entering={SlideInLeft.duration(400)} exiting={SlideOutLeft.duration(400)} style={{ flex: 1 }}>
                                <AnimatedInput
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                    onSubmitEditing={() => lastNameRef.current?.focus()}
                                    accessibilityLabel="First Name"
                                    delay={100}
                                />

                                <AnimatedInput
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                    autoCapitalize="words"
                                    ref={lastNameRef}
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                    accessibilityLabel="Last Name"
                                    delay={200}
                                    marginTop={Spacing.lg}
                                />

                                <AnimatedInput
                                    placeholder="Email"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    ref={emailRef}
                                    returnKeyType="done"
                                    onSubmitEditing={handleContinue}
                                    accessibilityLabel="Email"
                                    delay={300}
                                    marginTop={Spacing.lg}
                                />

                                <PrimaryButton
                                    title="Continue"
                                    onPress={handleContinue}
                                    delay={400}
                                    size="large"
                                    marginTop={Spacing.massive}
                                />
                            </Animated.View>
                        ) : step === 2 ? (
                            <Animated.View key="step2" entering={SlideInRight.duration(400)} exiting={SlideOutRight.duration(400)} style={{ flex: 1 }}>
                                <AnimatedInput
                                    placeholder="Password"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    isPassword={true}
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                    ref={passwordRef}
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                    accessibilityLabel="Password"
                                    delay={100}
                                />

                                <AnimatedInput
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    isPassword={true}
                                    showPassword={showPassword}
                                    ref={confirmPasswordRef}
                                    returnKeyType="done"
                                    onSubmitEditing={handleContinue}
                                    accessibilityLabel="Confirm Password"
                                    delay={200}
                                    marginTop={Spacing.lg}
                                />

                                <PrimaryButton
                                    title="Continue"
                                    onPress={handleContinue}
                                    delay={300}
                                    size="large"
                                    marginTop={Spacing.massive}
                                />
                            </Animated.View>
                        ) : (
                            <Animated.View key="step3" entering={SlideInRight.duration(400)} exiting={SlideOutRight.duration(400)} style={{ flex: 1 }}>
                                <AnimatedInput
                                    placeholder="Username"
                                    value={formData.username}
                                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                                    autoCapitalize="none"
                                    ref={usernameRef}
                                    returnKeyType="done"
                                    onSubmitEditing={handleRegister}
                                    accessibilityLabel="Username"
                                    delay={100}
                                />

                                <PrimaryButton
                                    title="Create Account"
                                    onPress={handleRegister}
                                    isLoading={isLoading}
                                    delay={200}
                                    size="large"
                                    marginTop={Spacing.massive}
                                />
                            </Animated.View>
                        )}
                    </View>

                    <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.footer}>
                        <Pressable onPress={() => router.push({ pathname: "/login" })}>
                            <ThemedText variant="labelLarge" colorName="primary" style={styles.footerText}>Login to existing account</ThemedText>
                        </Pressable>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </ScreenLayout>
        </>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    header: {
        marginBottom: Spacing.xl,
        alignItems: "center",
    },
    stepIndicatorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: Spacing.lg,
        gap: Spacing.sm,
    },
    stepDot: {
        width: 24,
        height: 4,
        borderRadius: BorderRadius.full,
    },
    title: {
        fontWeight: "800",
        marginBottom: Spacing.md,
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        fontWeight: "600",
        lineHeight: 28,
    },
    form: {
        flex: 1,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: Spacing.xl,
        marginTop: Spacing.lg,
    },
    footerText: {
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
