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
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    SharedValue,
} from "react-native-reanimated";
import { Colors, Shadows } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/auth-context";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { register } = useAuth();

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

    // Animation values for input focus
    const usernameFocus = useSharedValue(0);
    const fullNameFocus = useSharedValue(0);
    const emailFocus = useSharedValue(0);
    const universityIdFocus = useSharedValue(0);
    const passwordFocus = useSharedValue(0);

    const getAnimatedStyle = (focusValue: SharedValue<number>) => {
        return useAnimatedStyle(() => ({
            borderColor: withTiming(focusValue.value ? theme.accent : "rgba(255,255,255,0.1)"),
            backgroundColor: withTiming(focusValue.value ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)"),
        }));
    };

    const handleRegister = async () => {
        const { username, fullName, email, universityId, password, confirmPassword } = formData;

        if (!username || !fullName || !email || !universityId || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (!email.endsWith(".edu") && !email.includes("university")) {
            // Relaxed for development, but good to have a hint
            // Alert.alert("Tip", "Please use your university email if possible");
        }

        setIsLoading(true);
        try {
            await register({
                fullName,
                email,
                universityId,
                password,
                role: 'student', // Default role
            });

            Alert.alert(
                "Success",
                "Account created successfully! Please sign in.",
                [{ text: "OK", onPress: () => router.push("/login") }]
            );
        } catch (error) {
            console.error("Registration failed:", error);
            Alert.alert("Registration Failed", "Could not create account. Email might already be in use.");
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

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                                    <Ionicons name="sparkles-sharp" size={32} color={theme.accent} />
                                </Animated.View>
                                <Animated.Text
                                    entering={FadeInDown.delay(500).duration(800)}
                                    style={styles.title}
                                >
                                    Join PuConnect
                                </Animated.Text>
                                <Animated.Text
                                    entering={FadeInDown.delay(600).duration(800)}
                                    style={styles.subtitle}
                                >
                                    Create an account to start collaborating with students
                                </Animated.Text>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                <Animated.View entering={FadeInUp.delay(700).duration(800)}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(fullNameFocus)]}>
                                        <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="John Doe"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.fullName}
                                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                            onFocus={() => (fullNameFocus.value = 1)}
                                            onBlur={() => (fullNameFocus.value = 0)}
                                            autoCapitalize="words"
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(750).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>Username</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(usernameFocus)]}>
                                        <Ionicons name="at-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="johndoe"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.username}
                                            onChangeText={(text) => setFormData({ ...formData, username: text })}
                                            onFocus={() => (usernameFocus.value = 1)}
                                            onBlur={() => (usernameFocus.value = 0)}
                                            autoCapitalize="none"
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(800).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>University Email</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(emailFocus)]}>
                                        <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="name@university.edu"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.email}
                                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                                            onFocus={() => (emailFocus.value = 1)}
                                            onBlur={() => (emailFocus.value = 0)}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(850).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>University ID</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(universityIdFocus)]}>
                                        <Ionicons name="card-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="20230001"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.universityId}
                                            onChangeText={(text) => setFormData({ ...formData, universityId: text })}
                                            onFocus={() => (universityIdFocus.value = 1)}
                                            onBlur={() => (universityIdFocus.value = 0)}
                                            autoCapitalize="none"
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(900).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(passwordFocus)]}>
                                        <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.password}
                                            onChangeText={(text) => setFormData({ ...formData, password: text })}
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
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(1000).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>Confirm Password</Text>
                                    <Animated.View style={[styles.inputContainer, { borderColor: "rgba(255,255,255,0.1)" }]}>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.confirmPassword}
                                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                            secureTextEntry={!showPassword}
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(1200).duration(800)} style={{ marginTop: 40, marginBottom: 40 }}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.registerButton,
                                            {
                                                backgroundColor: theme.accent,
                                                opacity: isLoading ? 0.7 : pressed ? 0.9 : 1,
                                                transform: [{ scale: pressed ? 0.98 : 1 }],
                                            },
                                        ]}
                                        onPress={handleRegister}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#0f172a" />
                                        ) : (
                                            <>
                                                <Text style={styles.registerButtonText}>Create Account</Text>
                                                <Ionicons name="arrow-forward" size={20} color="#0f172a" />
                                            </>
                                        )}
                                    </Pressable>
                                </Animated.View>
                            </View>

                            {/* Footer */}
                            <Animated.View
                                entering={FadeInUp.delay(1400).duration(800)}
                                style={styles.footer}
                            >
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <Pressable onPress={() => router.push("/login")}>
                                    <Text style={[styles.footerLink, { color: theme.accent }]}>Sign In</Text>
                                </Pressable>
                            </Animated.View>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    scrollContent: {
        flexGrow: 1,
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
        marginBottom: 30,
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
        marginBottom: 8,
        marginLeft: 4,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    inputContainer: {
        height: 60,
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
    registerButton: {
        height: 68,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        ...Shadows.medium,
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#0f172a",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 40,
        marginTop: "auto",
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
