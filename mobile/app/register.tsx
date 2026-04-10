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
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { AnimatedInput } from "@/components/ui/animated-input";
import { PrimaryButton } from "@/components/ui/primary-button";

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

    const handleRegister = async () => {
        const { fullName, email, universityId, password, confirmPassword } = formData;

        // BYPASS AUTH CHECKS FOR TESTING
        /*
        if (!fullName || !email || !universityId || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        */

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
                                <AnimatedInput
                                    label="Full Name"
                                    iconName="person-outline"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                    autoCapitalize="words"
                                    delay={400}
                                />

                                <AnimatedInput
                                    label="University Email"
                                    iconName="mail-outline"
                                    placeholder="name@university.edu"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    delay={500}
                                    marginTop={20}
                                />

                                <AnimatedInput
                                    label="University ID"
                                    iconName="card-outline"
                                    placeholder="20230001"
                                    value={formData.universityId}
                                    onChangeText={(text) => setFormData({ ...formData, universityId: text })}
                                    autoCapitalize="none"
                                    delay={600}
                                    marginTop={20}
                                />

                                <AnimatedInput
                                    label="Password"
                                    iconName="lock-closed-outline"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    isPassword={true}
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                    delay={700}
                                    marginTop={20}
                                />

                                <AnimatedInput
                                    label="Confirm Password"
                                    iconName="checkmark-circle-outline"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    isPassword={true}
                                    showPassword={showPassword}
                                    delay={800}
                                    marginTop={20}
                                />

                                <PrimaryButton
                                    title="Create Account"
                                    onPress={handleRegister}
                                    isLoading={isLoading}
                                    delay={1000}
                                    marginTop={40}
                                />
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
    showPassword: {
        padding: 10,
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
