import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Pressable,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { AnimatedInput } from "@/components/ui/animated-input";
import { PrimaryButton } from "@/components/ui/primary-button";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
    const theme = Colors.light;
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        // BYPASS AUTH CHECKS FOR TESTING
        /*
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        */

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
            <View style={styles.container}>
                
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <View style={styles.content}>
                        {/* Back Button */}
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
                        </Pressable>

                        <View style={styles.header}>
                            <Image 
                                source={require("../assets/images/puconnect_logo.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Animated.Text entering={FadeInDown.delay(200).duration(800)} style={styles.title}>
                                Welcome Back
                            </Animated.Text>
                            <Animated.Text entering={FadeInDown.delay(300).duration(800)} style={styles.subtitle}>
                                Please enter your details to sign in
                            </Animated.Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <AnimatedInput
                                label="Email Address"
                                iconName="mail-outline"
                                placeholder="email@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                delay={400}
                            />

                            <AnimatedInput
                                label="Password"
                                iconName="lock-closed-outline"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                isPassword={true}
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword(!showPassword)}
                                delay={500}
                                marginTop={24}
                            />
                            
                            <Animated.View entering={FadeInDown.delay(500).duration(800)}>
                                <Pressable style={styles.forgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                                </Pressable>
                            </Animated.View>

                            <PrimaryButton
                                title="Sign In"
                                onPress={handleLogin}
                                isLoading={isLoading}
                                delay={700}
                                marginTop={40}
                            />
                        </View>

                        {/* Footer */}
                        <Animated.View entering={FadeInDown.delay(900).duration(800)} style={styles.footer}>
                            <Text style={styles.footerText}>New here? </Text>
                            <Pressable onPress={() => router.push("/register")}>
                                <Text style={styles.footerLink}>Create Account</Text>
                            </Pressable>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f9f9f9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    header: {
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 40,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#888",
        fontWeight: "400",
    },
    form: {
        flex: 1,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: 12,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 40,
        marginTop: 20,
    },
    footerText: {
        fontSize: 15,
        color: "#888",
        fontWeight: "500",
    },
    footerLink: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
    },
});
