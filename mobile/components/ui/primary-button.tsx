import React from "react";
import { StyleSheet, Pressable, PressableProps, ActivityIndicator, ViewStyle, StyleProp, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/theme-context";
import { BorderRadius, Spacing, Gradients } from "@/constants/theme";
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps extends PressableProps {
    title: string;
    isLoading?: boolean;
    delay?: number;
    marginTop?: number;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
    title,
    isLoading = false,
    delay = 0,
    marginTop = 0,
    variant = 'primary',
    size = 'medium',
    style,
    ...props
}: PrimaryButtonProps) {
    const { theme } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    button: { backgroundColor: theme.secondaryContainer },
                    text: { colorName: 'onSecondaryContainer' as const },
                };
            case 'outline':
                return {
                    button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.outline },
                    text: { colorName: 'primary' as const },
                };
            case 'ghost':
                return {
                    button: { backgroundColor: 'transparent' },
                    text: { colorName: 'primary' as const },
                };
            default:
                return {
                    button: { backgroundColor: theme.primary },
                    text: { colorName: 'onPrimary' as const },
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    button: { height: 40, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md },
                    text: { variant: 'labelLarge' as const },
                };
            case 'large':
                return {
                    button: { height: 56, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.full },
                    text: { variant: 'titleMedium' as const },
                };
            default:
                return {
                    button: { height: 48, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.lg },
                    text: { variant: 'titleSmall' as const },
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    const content = (
        <>
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? theme.onPrimary : theme.primary} />
            ) : (
                <ThemedText 
                    variant={sizeStyles.text.variant} 
                    colorName={variantStyles.text.colorName}
                    style={styles.buttonText}
                >
                    {title}
                </ThemedText>
            )}
        </>
    );

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(800)} style={{ marginTop }}>
            <Pressable
                style={(state) => [
                    styles.button,
                    variant !== 'primary' && variantStyles.button,
                    sizeStyles.button,
                    {
                        opacity: isLoading || props.disabled ? 0.8 : 1,
                        transform: [{ scale: state.pressed ? 0.98 : 1 }],
                    },
                    style as ViewStyle,
                ]}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {({ pressed }) => (
                    variant === 'primary' ? (
                        <LinearGradient
                            colors={Gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.gradient, sizeStyles.button, { opacity: pressed ? 0.9 : 1 }]}
                        >
                            {content}
                        </LinearGradient>
                    ) : (
                        <View style={[styles.inner, { opacity: pressed ? 0.9 : 1 }]}>
                            {content}
                        </View>
                    )
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row',
    },
    inner: {
        flex: 1,
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row',
    },
    buttonText: {
        fontWeight: "700",
    },
});
