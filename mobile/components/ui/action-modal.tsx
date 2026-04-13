import React from 'react';
import { Modal, StyleSheet, View, Pressable, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { ThemedText } from '../themed-text';
import { ThemedIcon, IconName } from './themed-icon';
import { PrimaryButton } from './primary-button';

interface ActionModalProps {
    visible: boolean;
    onRequestClose: () => void;
    iconName?: IconName;
    title: string;
    subtitle?: string;
    primaryButtonTitle?: string;
    onPrimaryPress?: () => void;
    secondaryButtonTitle?: string;
    onSecondaryPress?: () => void;
    children?: React.ReactNode;
    style?: ViewStyle;
}

export function ActionModal({
    visible,
    onRequestClose,
    iconName,
    title,
    subtitle,
    primaryButtonTitle,
    onPrimaryPress,
    secondaryButtonTitle,
    onSecondaryPress,
    children,
    style,
}: ActionModalProps) {
    const { theme, isDark } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <BlurView intensity={isDark ? 40 : 20} tint={isDark ? 'dark' : 'light'} style={styles.modalOverlay}>
                <Animated.View entering={FadeInDown.duration(400)} style={[styles.modalContent, { backgroundColor: theme.surface }, style]}>
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        {iconName && (
                            <View style={[styles.modalIconContainer, { backgroundColor: theme.primaryContainer }]}>
                                <ThemedIcon name={iconName} size={32} colorName="primary" />
                            </View>
                        )}
                        
                        <ThemedText variant="headlineMedium" colorName="primary" style={styles.modalTitle}>
                            {title}
                        </ThemedText>
                        
                        {subtitle && (
                            <ThemedText variant="bodyMedium" colorName="textSecondary" style={styles.modalSubtitle}>
                                {subtitle}
                            </ThemedText>
                        )}

                        {children && <View style={styles.childrenContainer}>{children}</View>}

                        {primaryButtonTitle && onPrimaryPress && (
                            <PrimaryButton
                                title={primaryButtonTitle}
                                onPress={onPrimaryPress}
                                marginTop={children ? Spacing.xl : Spacing.md}
                            />
                        )}

                        {secondaryButtonTitle && onSecondaryPress && (
                            <Pressable onPress={onSecondaryPress} style={styles.cancelButton}>
                                <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.cancelText}>
                                    {secondaryButtonTitle}
                                </ThemedText>
                            </Pressable>
                        )}
                    </View>
                </Animated.View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.xl,
    },
    modalContent: {
        width: "100%",
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        fontWeight: "800",
        marginBottom: Spacing.sm,
        textAlign: "center",
    },
    modalSubtitle: {
        textAlign: "center",
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    childrenContainer: {
        width: '100%',
    },
    cancelButton: {
        marginTop: Spacing.lg,
        padding: Spacing.sm,
    },
    cancelText: {
        fontWeight: "600",
    },
});
