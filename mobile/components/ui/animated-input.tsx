import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

interface AnimatedInputProps extends TextInputProps {
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    delay?: number;
    marginTop?: number;
    isPassword?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
}

export function AnimatedInput({
    label,
    iconName,
    delay = 0,
    marginTop = 0,
    isPassword = false,
    showPassword = false,
    onTogglePassword,
    ...props
}: AnimatedInputProps) {
    const focusValue = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(focusValue.value ? "#1a1a1a" : "#f0f0f0"),
        backgroundColor: withTiming(focusValue.value ? "#ffffff" : "#f9f9f9"),
    }));

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(800)} style={{ marginTop }}>
            <Text style={styles.inputLabel}>{label}</Text>
            <Animated.View style={[styles.inputContainer, animatedStyle]}>
                <Ionicons name={iconName} size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#bbb"
                    onFocus={(e) => {
                        focusValue.value = 1;
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        focusValue.value = 0;
                        props.onBlur?.(e);
                    }}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />
                {isPassword && onTogglePassword && (
                    <Pressable onPress={onTogglePassword} style={styles.showPassword}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#888"
                        />
                    </Pressable>
                )}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
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
});
