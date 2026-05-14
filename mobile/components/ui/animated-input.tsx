import React, { useMemo } from "react";
import { StyleSheet, TextInput, TextInputProps, Pressable, View } from "react-native";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolate } from "react-native-reanimated";
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

export const AnimatedInput = React.forwardRef<TextInput, AnimatedInputProps>(({
    label,
    iconName,
    delay = 0,
    marginTop = 0,
    isPassword = false,
    showPassword = false,
    onTogglePassword,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const focusValue = useSharedValue(0);
    const hasValue = useMemo(() => props.value && props.value.length > 0, [props.value]);

    // Use standard React state for focus to handle non-animatable props like placeholder
    const [isFocused, setIsFocused] = React.useState(false);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(focusValue.value ? theme.primary : theme.outlineVariant),
        backgroundColor: withTiming(focusValue.value ? theme.surface : theme.surfaceVariant),
    }));

    // Label should float if focused OR has value
    const isFloatingValue = useSharedValue(hasValue ? 1 : 0);

    React.useEffect(() => {
        isFloatingValue.value = withTiming(isFocused || hasValue ? 1 : 0, { duration: 200 });
        focusValue.value = isFocused ? 1 : 0;
    }, [isFocused, hasValue, isFloatingValue, focusValue]);

    const animatedLabelStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: interpolate(isFloatingValue.value, [0, 1], [0, -28], Extrapolate.CLAMP) },
                { scale: interpolate(isFloatingValue.value, [0, 1], [1, 0.75], Extrapolate.CLAMP) },
            ],
            color: withTiming(focusValue.value ? theme.primary : theme.textMuted),
            paddingHorizontal: interpolate(isFloatingValue.value, [0, 1], [0, 4], Extrapolate.CLAMP),
        };
    });

    const labelBgStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(isFloatingValue.value, [0, 1], [0, 1], Extrapolate.CLAMP),
            backgroundColor: withTiming(focusValue.value ? theme.surface : theme.surfaceVariant),
        };
    });

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(800)} style={{ marginTop }}>
            {label && <ThemedText variant="labelLarge" style={styles.inputLabel}>{label}</ThemedText>}
            <Animated.View style={[styles.inputContainer, animatedContainerStyle]}>
                <View style={styles.contentWrapper}>
                    {iconName && <ThemedIcon name={iconName} size={20} colorName="textMuted" style={styles.inputIcon} />}
                    
                    <View style={styles.inputFieldContainer}>
                        {/* Floating Label with Background Mask */}
                        <Animated.View 
                            pointerEvents="none"
                            style={[
                                styles.floatingLabelContainer,
                                animatedLabelStyle,
                            ]}
                        >
                            <Animated.View style={[styles.labelBackground, labelBgStyle]} />
                            <Animated.Text 
                                style={styles.floatingLabelText}
                            >
                                {props.placeholder}
                            </Animated.Text>
                        </Animated.View>

                        <TextInput
                            ref={ref}
                            style={[styles.input, { color: theme.text }]}
                            placeholderTextColor={isFocused ? "transparent" : theme.textMuted}
                            onFocus={(e) => {
                                setIsFocused(true);
                                props.onFocus?.(e);
                            }}
                            onBlur={(e) => {
                                setIsFocused(false);
                                props.onBlur?.(e);
                            }}
                            secureTextEntry={isPassword && !showPassword}
                            {...props}
                            placeholder={isFocused ? "" : props.placeholder}
                        />
                    </View>

                    {isPassword && onTogglePassword && (
                        <Pressable onPress={onTogglePassword} style={styles.showPassword}>
                            <ThemedIcon
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                colorName="textMuted"
                            />
                        </Pressable>
                    )}
                </View>
            </Animated.View>
        </Animated.View>
    );
});

AnimatedInput.displayName = 'AnimatedInput';

const styles = StyleSheet.create({
    inputLabel: {
        fontWeight: "600",
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        height: 56,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        paddingHorizontal: Spacing.lg,
        justifyContent: "center",
    },
    contentWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: "100%",
    },
    inputFieldContainer: {
        flex: 1,
        height: "100%",
        justifyContent: "center",
        position: "relative",
    },
    floatingLabelContainer: {
        position: "absolute",
        left: 0,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 4,
    },
    floatingLabelText: {
        fontSize: 16,
        fontWeight: "500",
        zIndex: 2,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        fontSize: 16,
        fontWeight: "500",
        padding: 0,
        margin: 0,
        zIndex: 0,
    },
    showPassword: {
        padding: Spacing.sm,
    },
});
