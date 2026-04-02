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
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
    const theme = Colors.light;
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const emailFocus = useSharedValue(0);
    const passwordFocus = useSharedValue(0);

    const emailStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(emailFocus.value ? "#1a1a1a" : "#f0f0f0"),
        backgroundColor: withTiming(emailFocus.value ? "#ffffff" : "#f9f9f9"),
    }));

    const passwordStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(passwordFocus.value ? "#1a1a1a" : "#f0f0f0"),
        backgroundColor: withTiming(passwordFocus.value ? "#ffffff" : "#f9f9f9"),
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
                <StatusBar style="dark" />
                
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
                            <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                                <Text style={styles.inputLabel}>EmailAddress</Text>
                                <Animated.View style={[styles.inputContainer, emailStyle]}>
                                    <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email@example.com"
                                        placeholderTextColor="#bbb"
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => (emailFocus.value = 1)}
                                        onBlur={() => (emailFocus.value = 0)}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </Animated.View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(500).duration(800)} style={{ marginTop: 24 }}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <Animated.View style={[styles.inputContainer, passwordStyle]}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor="#bbb"
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
                                            color="#888"
                                        />
                                    </Pressable>
                                </Animated.View>
                                <Pressable style={styles.forgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                                </Pressable>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(700).duration(800)} style={{ marginTop: 40 }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.loginButton,
                                        {
                                            opacity: isLoading || pressed ? 0.8 : 1,
                                            transform: [{ scale: pressed ? 0.98 : 1 }],
                                        },
                                    ]}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Text style={styles.loginButtonText}>Sign In</Text>
                                    )}
                                </Pressable>
                            </Animated.View>
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
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 10,
    },
    inputContainer: {
        height: 60,
        borderRadius: 30,
        borderWidth: 1.5,
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
        color: "#1a1a1a",
        fontSize: 16,
        fontWeight: "500",
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
        fontWeight: "600",
        color: "#1a1a1a",
    },
    loginButton: {
        height: 60,
        borderRadius: 30,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
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
