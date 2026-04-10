import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    Image,
} from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/context/auth-context";
import { AnimatedInput } from "@/components/ui/animated-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { useTheme } from "@/context/theme-context";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";

const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

export default function RegisterScreen() {
    const { theme } = useTheme();
    const { register } = useAuth();
    const { spacingMultiplier } = useResponsive();

    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        universityId: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const horizontalPadding = Spacing.xl * spacingMultiplier;

    const handleRegister = async () => {
        const { fullName, email, universityId, password } = formData;

        setIsLoading(true);
        try {
            await register({
                fullName,
                email,
                universityId,
                password,
                role: 'student',
            });

            Alert.alert(
                "Success",
                "Account created successfully!",
                [{ text: "OK", onPress: () => router.push("/login") }]
            );
        } catch (error) {
            console.error("Registration failed:", error);
            Alert.alert("Registration Failed", "Could not create account.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScreenLayout padding="large" keyboardAvoiding scrollable>
                <View style={styles.content}>
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
                            Create Account
                        </AnimatedThemedText>
                        <AnimatedThemedText entering={FadeInDown.delay(300).duration(800)} variant="bodyLarge" colorName="textSecondary">
                            Fill in your details to get started
                        </AnimatedThemedText>
                    </View>

                    <View style={styles.form}>
                        <AnimatedInput
                            label="Full Name"
                            iconName="account"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                            autoCapitalize="words"
                            delay={400}
                        />

                        <AnimatedInput
                            label="University Email"
                            iconName="email"
                            placeholder="name@university.edu"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            delay={500}
                            marginTop={Spacing.lg}
                        />

                        <AnimatedInput
                            label="University ID"
                            iconName="card-account-details"
                            placeholder="20230001"
                            value={formData.universityId}
                            onChangeText={(text) => setFormData({ ...formData, universityId: text })}
                            autoCapitalize="none"
                            delay={600}
                            marginTop={Spacing.lg}
                        />

                        <AnimatedInput
                            label="Password"
                            iconName="lock"
                            placeholder="••••••••"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            isPassword={true}
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            delay={700}
                            marginTop={Spacing.lg}
                        />

                        <AnimatedInput
                            label="Confirm Password"
                            iconName="check-circle"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                            isPassword={true}
                            showPassword={showPassword}
                            delay={800}
                            marginTop={Spacing.lg}
                        />

                        <PrimaryButton
                            title="Create Account"
                            onPress={handleRegister}
                            isLoading={isLoading}
                            delay={1000}
                            size="large"
                            marginTop={Spacing.massive}
                        />
                    </View>

                    <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.footer}>
                        <ThemedText variant="bodyMedium" colorName="textSecondary">Already have an account? </ThemedText>
                        <Pressable onPress={() => router.push("/login")}>
                            <ThemedText variant="labelLarge" colorName="primary">Sign In</ThemedText>
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
        marginBottom: Spacing.xl,
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
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: Spacing.xl,
        marginTop: Spacing.lg,
    },
});
