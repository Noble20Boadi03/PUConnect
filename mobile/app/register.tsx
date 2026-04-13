import React, { useState, useRef } from "react";
import { TextInput } from "react-native";
import {
    StyleSheet,
    View,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
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
    const { spacingMultiplier, contentPaddingLeft, contentPaddingRight } = useResponsive();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        universityId: "",
        password: "",
        confirmPassword: "",
    });
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Keyboard accessibility references
    const emailRef = useRef<TextInput>(null);
    const uniIdRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const insets = useSafeAreaInsets();

    const handleContinue = () => {
        if (!formData.fullName || !formData.email || !formData.universityId) {
            showAlert({ title: "Incomplete Fields", subtitle: "Please fill in all identity fields to continue.", severity: "warning" });
            return;
        }
        if (!formData.email.includes('@')) {
            showAlert({ title: "Invalid Email", subtitle: "Please enter a valid university email address.", severity: "warning" });
            return;
        }
        setStep(2);
    };

    const handleRegister = async () => {
        const { fullName, email, password, confirmPassword } = formData;

        if (!password || password.length < 6) {
            showAlert({ title: "Weak Password", subtitle: "Password must be at least 6 characters long.", severity: "warning" });
            return;
        }
        if (password !== confirmPassword) {
            showAlert({ title: "Password Mismatch", subtitle: "Passwords do not match. Please try again.", severity: "warning" });
            return;
        }

        setIsLoading(true);
        try {
            await register({
                fullName,
                email,
                password,
                role: 'student',
            });

            showAlert({
                title: "Success",
                subtitle: "Account created successfully!",
                severity: "success",
                primaryButtonTitle: "Login",
                onPrimaryPress: () => router.push({ pathname: "/login" })
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
                    {/* Dynamic Back Button for Option A */}
                    {step === 2 && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            <Pressable 
                                onPress={() => setStep(1)} 
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
                            {step === 1 ? "Create Account" : "Secure Account"}
                        </AnimatedThemedText>
                        <AnimatedThemedText key={`sub-${step}`} entering={FadeInDown.delay(100).duration(400)} variant="titleLarge" style={styles.subtitle}>
                            {step === 1 ? "Join us and start building\nyour campus network!" : "Choose a strong password\nto protect your profile."}
                        </AnimatedThemedText>
                        
                        {/* Step Indicator */}
                        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.stepIndicatorContainer}>
                            <View style={[styles.stepDot, { backgroundColor: step === 1 ? theme.primary : theme.surfaceVariant }]} />
                            <View style={[styles.stepDot, { backgroundColor: step === 2 ? theme.primary : theme.surfaceVariant }]} />
                        </Animated.View>
                    </View>

                    <View style={styles.form}>
                        {step === 1 ? (
                            <Animated.View key="step1" entering={SlideInLeft.duration(400)} exiting={SlideOutLeft.duration(400)} style={{ flex: 1 }}>
                                <AnimatedInput
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                    accessibilityLabel="Full Name"
                                    delay={100}
                                />

                                <AnimatedInput
                                    placeholder="University Email"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    ref={emailRef}
                                    returnKeyType="next"
                                    onSubmitEditing={() => uniIdRef.current?.focus()}
                                    accessibilityLabel="University Email"
                                    delay={200}
                                    marginTop={Spacing.lg}
                                />

                                <AnimatedInput
                                    placeholder="University ID"
                                    value={formData.universityId}
                                    onChangeText={(text) => setFormData({ ...formData, universityId: text })}
                                    autoCapitalize="none"
                                    ref={uniIdRef}
                                    returnKeyType="done"
                                    onSubmitEditing={handleContinue}
                                    accessibilityLabel="University ID"
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
                        ) : (
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
                                    onSubmitEditing={handleRegister}
                                    accessibilityLabel="Confirm Password"
                                    delay={200}
                                    marginTop={Spacing.lg}
                                />

                                <PrimaryButton
                                    title="Create Account"
                                    onPress={handleRegister}
                                    isLoading={isLoading}
                                    delay={300}
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
