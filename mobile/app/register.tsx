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
    SharedValue,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
    const theme = Colors.light;
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

    const usernameFocus = useSharedValue(0);
    const fullNameFocus = useSharedValue(0);
    const emailFocus = useSharedValue(0);
    const universityIdFocus = useSharedValue(0);
    const passwordFocus = useSharedValue(0);

    const getAnimatedStyle = (focusValue: SharedValue<number>) => {
        return useAnimatedStyle(() => ({
            borderColor: withTiming(focusValue.value ? "#1a1a1a" : "#f0f0f0"),
            backgroundColor: withTiming(focusValue.value ? "#ffffff" : "#f9f9f9"),
        }));
    };

    const handleRegister = async () => {
        const { fullName, email, universityId, password, confirmPassword } = formData;

        if (!fullName || !email || !universityId || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

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
            <View style={styles.container}>
                <StatusBar style="dark" />
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <View style={styles.content}>
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
                                    Create Account
                                </Animated.Text>
                                <Animated.Text entering={FadeInDown.delay(300).duration(800)} style={styles.subtitle}>
                                    Fill in your details to get started
                                </Animated.Text>
                            </View>

                            <View style={styles.form}>
                                <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(fullNameFocus)]}>
                                        <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="John Doe"
                                            placeholderTextColor="#bbb"
                                            value={formData.fullName}
                                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                            onFocus={() => (fullNameFocus.value = 1)}
                                            onBlur={() => (fullNameFocus.value = 0)}
                                            autoCapitalize="words"
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(500).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>University Email</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(emailFocus)]}>
                                        <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="name@university.edu"
                                            placeholderTextColor="#bbb"
                                            value={formData.email}
                                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                                            onFocus={() => (emailFocus.value = 1)}
                                            onBlur={() => (emailFocus.value = 0)}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(600).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>University ID</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(universityIdFocus)]}>
                                        <Ionicons name="card-outline" size={20} color="#888" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="20230001"
                                            placeholderTextColor="#bbb"
                                            value={formData.universityId}
                                            onChangeText={(text) => setFormData({ ...formData, universityId: text })}
                                            onFocus={() => (universityIdFocus.value = 1)}
                                            onBlur={() => (universityIdFocus.value = 0)}
                                            autoCapitalize="none"
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(700).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                    <Animated.View style={[styles.inputContainer, getAnimatedStyle(passwordFocus)]}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor="#bbb"
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
                                                color="#888"
                                            />
                                        </Pressable>
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(800).duration(800)} style={{ marginTop: 20 }}>
                                    <Text style={styles.inputLabel}>Confirm Password</Text>
                                    <Animated.View style={[styles.inputContainer, { borderColor: "#f0f0f0", backgroundColor: "#f9f9f9" }]}>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#888" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor="#bbb"
                                            value={formData.confirmPassword}
                                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                            secureTextEntry={!showPassword}
                                        />
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(1000).duration(800)} style={{ marginTop: 40, marginBottom: 40 }}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.registerButton,
                                            {
                                                opacity: isLoading || pressed ? 0.8 : 1,
                                                transform: [{ scale: pressed ? 0.98 : 1 }],
                                            },
                                        ]}
                                        onPress={handleRegister}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <Text style={styles.registerButtonText}>Create Account</Text>
                                        )}
                                    </Pressable>
                                </Animated.View>
                            </View>

                            <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <Pressable onPress={() => router.push("/login")}>
                                    <Text style={styles.footerLink}>Sign In</Text>
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
        backgroundColor: "#ffffff",
    },
    scrollContent: {
        flexGrow: 1,
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
        marginBottom: 30,
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
    registerButton: {
        height: 60,
        borderRadius: 30,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
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
        color: "#888",
        fontWeight: "500",
    },
    footerLink: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
    },
});
