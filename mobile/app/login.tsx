import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/context/auth-context";
import { AnimatedInput } from "@/components/ui/animated-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { useTheme } from "@/context/theme-context";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";

const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

export default function LoginScreen() {
    const { theme, isDark } = useTheme();
    const { signIn } = useAuth();
    const { spacingMultiplier } = useResponsive();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const horizontalPadding = Spacing.xl * spacingMultiplier;

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn(email, password);
            router.replace("/(tabs)/home");
        } catch (error) {
            console.error("Login failed:", error);
            Alert.alert("Login Failed", "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScreenLayout padding="large" keyboardAvoiding scrollable>
                <View style={styles.content}>
                    {/* Back Button */}
                    <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surfaceVariant }]}>
                        <ThemedIcon name="chevron-left" size={24} />
                    </Pressable>

                    <View style={styles.header}>
                        <Image 
                            source={require("../assets/images/puconnect_logo.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <AnimatedThemedText entering={FadeInDown.delay(200).duration(800)} variant="headlineLarge" style={styles.title}>
                            Welcome Back
                        </AnimatedThemedText>
                        <AnimatedThemedText entering={FadeInDown.delay(300).duration(800)} variant="bodyLarge" colorName="textSecondary">
                            Please enter your details to sign in
                        </AnimatedThemedText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <AnimatedInput
                            label="Email Address"
                            iconName="email-outline"
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            delay={400}
                        />

                        <AnimatedInput
                            label="Password"
                            iconName="lock-outline"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            isPassword={true}
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            delay={500}
                            marginTop={Spacing.xl}
                        />
                        
                        <Animated.View entering={FadeInDown.delay(500).duration(800)}>
                            <Pressable style={styles.forgotPassword}>
                                <ThemedText variant="labelLarge" colorName="primary" style={styles.forgotPasswordText}>
                                    Forgot password?
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

                    {/* Footer */}
                    <Animated.View entering={FadeInDown.delay(900).duration(800)} style={styles.footer}>
                        <ThemedText variant="bodyMedium" colorName="textSecondary">New here? </ThemedText>
                        <Pressable onPress={() => router.push("/register")}>
                            <ThemedText variant="labelLarge" colorName="primary">Create Account</ThemedText>
                        </Pressable>
                    </Animated.View>
                </View>
            </ScreenLayout>
        </TouchableWithoutFeedback>
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
        marginBottom: Spacing.massive,
    },
    logo: {
        width: 120,
        height: 40,
        marginBottom: Spacing.xl,
    },
    title: {
        fontWeight: "800",
        marginBottom: Spacing.xs,
    },
    form: {
        flex: 1,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: Spacing.md,
    },
    forgotPasswordText: {
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: Spacing.xl,
        marginTop: Spacing.lg,
    },
});
