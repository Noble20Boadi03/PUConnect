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
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Colors, Shadows } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/auth-context";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Animation values for input focus
    const emailFocus = useSharedValue(0);
    const passwordFocus = useSharedValue(0);

    const emailStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(emailFocus.value ? theme.accent : "rgba(255,255,255,0.1)"),
        backgroundColor: withTiming(emailFocus.value ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)"),
    }));

    const passwordStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(passwordFocus.value ? theme.accent : "rgba(255,255,255,0.1)"),
        backgroundColor: withTiming(passwordFocus.value ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)"),
    }));

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

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
                <StatusBar style="light" />
                <LinearGradient
                    colors={["#0f172a", "#1e293b", "#0f172a"]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Decorative Orbs */}
                <View
                    style={[
                        styles.orb,
                        {
                            top: -100,
                            right: -50,
                            backgroundColor: theme.primary + "22",
                            width: 300,
                            height: 300,
                            borderRadius: 150,
                        },
                    ]}
                />
                <View
                    style={[
                        styles.orb,
                        {
                            bottom: -50,
                            left: -100,
                            backgroundColor: theme.accent + "11",
                            width: 400,
                            height: 400,
                            borderRadius: 200,
                        },
                    ]}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <View style={styles.content}>
                        {/* Back Button */}
                        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                            <Pressable
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </Pressable>
                        </Animated.View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Animated.View
                                entering={FadeInDown.delay(400).duration(800)}
                                style={styles.logoBadge}
                            >
                                <Ionicons name="flash-sharp" size={32} color={theme.accent} />
                            </Animated.View>
                            <Animated.Text
                                entering={FadeInDown.delay(500).duration(800)}
                                style={styles.title}
                            >
                                Welcome Back
                            </Animated.Text>
                            <Animated.Text
                                entering={FadeInDown.delay(600).duration(800)}
                                style={styles.subtitle}
                            >
                                Sign in to continue your journey on PuConnect
                            </Animated.Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <Animated.View entering={FadeInUp.delay(800).duration(800)}>
                                <Text style={styles.inputLabel}>University Email</Text>
                                <Animated.View style={[styles.inputContainer, emailStyle]}>
                                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="name@university.edu"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => (emailFocus.value = 1)}
                                        onBlur={() => (emailFocus.value = 0)}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </Animated.View>
                            </Animated.View>

                            <Animated.View entering={FadeInUp.delay(900).duration(800)} style={{ marginTop: 20 }}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <Animated.View style={[styles.inputContainer, passwordStyle]}>
                                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => (passwordFocus.value = 1)}
                                        onBlur={() => (passwordFocus.value = 0)}
                                        secureTextEntry={!showPassword}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPassword}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="rgba(255,255,255,0.4)"
                                        />
                                    </Pressable>
                                </Animated.View>
                                <Pressable style={styles.forgotPassword}>
                                    <Text style={[styles.forgotPasswordText, { color: theme.accent }]}>Forgot Password?</Text>
                                </Pressable>
                            </Animated.View>

                            <Animated.View entering={FadeInUp.delay(1100).duration(800)} style={{ marginTop: 40 }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.loginButton,
                                        {
                                            backgroundColor: theme.accent,
                                            opacity: isLoading ? 0.7 : pressed ? 0.9 : 1,
                                            transform: [{ scale: pressed ? 0.98 : 1 }],
                                        },
                                    ]}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#0f172a" />
                                    ) : (
                                        <>
                                            <Text style={styles.loginButtonText}>Sign In</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#0f172a" />
                                        </>
                                    )}
                                </Pressable>
                            </Animated.View>
                        </View>

                        {/* Footer */}
                        <Animated.View
                            entering={FadeInUp.delay(1300).duration(800)}
                            style={styles.footer}
                        >
                            <Text style={styles.footerText}>New to PuConnect? </Text>
                            <Pressable onPress={() => router.push("/register")}>
                                <Text style={[styles.footerLink, { color: theme.accent }]}>Create Account</Text>
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
        backgroundColor: "#0f172a",
    },
    orb: {
        position: "absolute",
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        marginBottom: 30,
    },
    header: {
        marginBottom: 40,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: "#fff",
        letterSpacing: -1,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 24,
        fontWeight: "500",
    },
    form: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "rgba(255,255,255,0.4)",
        marginBottom: 10,
        marginLeft: 4,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    inputContainer: {
        height: 64,
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 12,
    },
    inputIcon: {
        width: 24,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    showPassword: {
        padding: 10,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: 12,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: "700",
    },
    loginButton: {
        height: 68,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        ...Shadows.medium,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#0f172a",
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
        color: "rgba(255,255,255,0.5)",
        fontWeight: "500",
    },
    footerLink: {
        fontSize: 15,
        fontWeight: "700",
    },
});
