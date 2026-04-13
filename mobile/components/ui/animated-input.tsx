import React from "react";
import { StyleSheet, TextInput, TextInputProps, View, Pressable } from "react-native";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon, IconName } from "@/components/ui/themed-icon";
import { useTheme } from "@/context/theme-context";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AnimatedInputProps extends TextInputProps {
    label?: string;
    iconName?: IconName;
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
    const { theme } = useTheme();
    const focusValue = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(focusValue.value ? theme.primary : theme.outlineVariant),
        backgroundColor: withTiming(focusValue.value ? theme.surface : theme.surfaceVariant),
    }));

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(800)} style={{ marginTop }}>
            {label && <ThemedText variant="labelLarge" style={styles.inputLabel}>{label}</ThemedText>}
            <Animated.View style={[styles.inputContainer, animatedStyle]}>
                {iconName && <ThemedIcon name={iconName} size={20} colorName="textMuted" style={styles.inputIcon} />}
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholderTextColor={theme.textMuted}
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
                        <ThemedIcon
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            colorName="textMuted"
                        />
                    </Pressable>
                )}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    inputLabel: {
        fontWeight: "600",
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        height: 56,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
    },
    showPassword: {
        padding: Spacing.sm,
    },
});
