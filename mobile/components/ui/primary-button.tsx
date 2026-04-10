import React from "react";
import { StyleSheet, Text, Pressable, PressableProps, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface PrimaryButtonProps extends PressableProps {
    title: string;
    isLoading?: boolean;
    delay?: number;
    marginTop?: number;
}

export function PrimaryButton({
    title,
    isLoading = false,
    delay = 0,
    marginTop = 0,
    style,
    disabledProps,
    ...props
}: PrimaryButtonProps & { disabledProps?: any }) {
    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(800)} style={{ marginTop }}>
            <Pressable
                style={(state) => [
                    styles.button,
                    {
                        opacity: isLoading || state.pressed ? 0.8 : 1,
                        transform: [{ scale: state.pressed ? 0.98 : 1 }],
                    },
                    typeof style === 'function' ? style(state) : style,
                ]}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>{title}</Text>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 60,
        borderRadius: 30,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
});
