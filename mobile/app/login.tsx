import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/context/auth-context";
import { useAppAlert } from "@/context/alert-context";
import { AnimatedInput } from "@/components/ui/animated-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { AuthBackground } from "@/components/ui/auth-background";
import { ActionModal } from "@/components/ui/action-modal";
import { useTheme } from "@/context/theme-context";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";

const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

export default function LoginScreen() {
    const { theme, isDark } = useTheme();
    const { signIn } = useAuth();
    const { showAlert } = useAppAlert();
    const insets = useSafeAreaInsets();
    const { spacingMultiplier, contentPaddingLeft, contentPaddingRight } = useResponsive();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Forgot Password Modal State
    const [isForgotModalVisible, setForgotModalVisible] = useState(false);
    const [isResetSent, setIsResetSent] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn(email, password);
            router.replace({ pathname: "/(tabs)/home" });
        } catch (error) {
            console.error("Login failed:", error);
            showAlert({
                title: "Login Failed",
                subtitle: "Invalid email or password. Please try again.",
                severity: "error",
                primaryButtonTitle: "Try Again"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = () => {
        if (!resetEmail) return;
        setIsResetSent(true);
    };

    const handleCloseModal = () => {
        setForgotModalVisible(false);
        setTimeout(() => {
            setIsResetSent(false);
            setResetEmail("");
        }, 400); // Wait for modal exit animation before resetting UI state
    };

    return (
        <>
            <AuthBackground />
            <ScreenLayout transparent padding="none" keyboardAvoiding scrollable contentContainerStyle={horizontalPadding}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.content}>
                    {/* Back Button */}
                    <Pressable 
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace("/");
                            }
                        }} 
                        style={[styles.backButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)', marginTop: insets.top + Spacing.sm }]}
                    >
                        <ThemedIcon name="chevron-left" size={24} lightColor="#ffffff" darkColor="#ffffff" />
                    </Pressable>

                    <View style={styles.header}>
                        <AnimatedThemedText entering={FadeInDown.delay(200).duration(800)} variant="headlineLarge" colorName="primary" style={styles.title}>
                            Login here
                        </AnimatedThemedText>
                        <AnimatedThemedText entering={FadeInDown.delay(300).duration(800)} variant="titleLarge" style={styles.subtitle}>
                            Welcome back you've{"\n"}been missed!
                        </AnimatedThemedText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <AnimatedInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            delay={400}
                        />

                        <AnimatedInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            isPassword={true}
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            delay={500}
                            marginTop={Spacing.xl}
                        />
                        
                        <Animated.View entering={FadeInDown.delay(500).duration(800)}>
                            <Pressable
                                onPress={() => setForgotModalVisible(true)}
                                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                style={({ pressed }) => [
                                    styles.forgotPasswordPill,
                                    { 
                                        backgroundColor: theme.primaryContainer,
                                        opacity: pressed ? 0.8 : 1,
                                        transform: [{ scale: pressed ? 0.96 : 1 }]
                                    }
                                ]}
                            >
                                <ThemedIcon name="key-outline" size={14} colorName="primary" style={{ marginRight: 6 }} />
                                <ThemedText variant="labelMedium" colorName="primary" style={styles.forgotPasswordText}>
                                    Forgot Password
                                </ThemedText>
                            </Pressable>
                        </Animated.View>

                        <PrimaryButton
                            title="Sign In"
                            onPress={handleLogin}
                            isLoading={isLoading}
                            delay={700}
                            size="large"
                            marginTop={Spacing.massive}
                        />
                    </View>

                    <Animated.View entering={FadeInDown.delay(900).duration(800)} style={styles.footer}>
                        <Pressable onPress={() => router.push({ pathname: "/register" })}>
                            <ThemedText variant="labelLarge" colorName="primary" style={styles.footerText}>Create new account</ThemedText>
                        </Pressable>
                    </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </ScreenLayout>

            {/* Custom Interactive Forgot Password Modal */}
            {isResetSent ? (
                <ActionModal
                    visible={isForgotModalVisible}
                    onRequestClose={handleCloseModal}
                    iconName="check-circle-outline"
                    title="Link Sent"
                    subtitle={`If ${resetEmail || 'that email'} matches an account, we've sent a reset link to it.`}
                    primaryButtonTitle="OK"
                    onPrimaryPress={handleCloseModal}
                />
            ) : (
                <ActionModal
                    visible={isForgotModalVisible}
                    onRequestClose={handleCloseModal}
                    iconName="email-fast-outline"
                    title="Reset Password"
                    subtitle="Enter your university email address. We'll send you a secure link to create a new password."
                    primaryButtonTitle="Send Reset Link"
                    onPrimaryPress={handleResetPassword}
                    secondaryButtonTitle="Cancel"
                    onSecondaryPress={handleCloseModal}
                >
                    <AnimatedInput
                        placeholder="Email"
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </ActionModal>
            )}
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
        marginBottom: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.xxl,
        alignItems: "center",
        marginTop: Spacing.xl,
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
    forgotPasswordPill: {
        alignSelf: "flex-end",
        marginTop: Spacing.xl,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    forgotPasswordText: {
        fontWeight: "700",
        fontSize: 13,
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
