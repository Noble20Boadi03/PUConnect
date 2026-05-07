import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, Platform, Switch } from 'react-native';
import { Stack, router } from 'expo-router';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { PasswordResetModal } from '@/components/ui/password-reset-modal';

import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { theme, isDark, setMode } = useTheme();
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader title="Settings" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            >
                {/* ─── SETTINGS GROUP ──────────────────────────── */}
                <View style={[styles.menuGroup, { backgroundColor: theme.surface, borderColor: theme.outlineVariant, marginTop: Spacing.xl }]}>
                    <View style={styles.menuItem}>
                        <View style={[styles.menuIconBox, { backgroundColor: theme.tertiaryContainer }]}>
                            <ThemedIcon name={isDark ? "moon-waning-crescent" : "white-balance-sunny"} size={20} colorName="onTertiaryContainer" />
                        </View>
                        <View style={styles.menuTextCol}>
                            <ThemedText variant="titleSmall" style={styles.menuItemTitle}>Dark Mode</ThemedText>
                            <ThemedText variant="bodySmall" colorName="textMuted">Toggle application theme</ThemedText>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
                            trackColor={{ false: theme.outlineVariant, true: theme.primary }}
                        />
                    </View>

                    <View style={[styles.menuDivider, { backgroundColor: theme.outlineVariant }]} />

                    <Pressable
                        style={({ pressed }) => [
                            styles.menuItem,
                            { backgroundColor: pressed ? theme.surfaceVariant : 'transparent' },
                        ]}
                        onPress={() => setIsResetModalVisible(true)}
                    >
                        <View style={[styles.menuIconBox, { backgroundColor: theme.surfaceVariant }]}>
                            <ThemedIcon name="lock-reset" size={20} colorName="text" />
                        </View>
                        <View style={styles.menuTextCol}>
                            <ThemedText variant="titleSmall" style={styles.menuItemTitle}>Reset Password</ThemedText>
                            <ThemedText variant="bodySmall" colorName="textMuted">Change your security credentials</ThemedText>
                        </View>
                        <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
                    </Pressable>
                </View>

                {/* ─── DANGER ZONE ──────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.logoutWrapper}>
                    <Pressable
                        style={[styles.logoutBtn, { borderColor: theme.error, backgroundColor: theme.errorContainer + '20' }]}
                        onPress={async () => {
                            await signOut();
                            router.replace('/login');
                        }}
                    >
                        <ThemedIcon name="logout" size={20} colorName="error" />
                        <ThemedText variant="titleMedium" colorName="error" style={{ fontWeight: '700' }}>Log Out</ThemedText>
                    </Pressable>
                    <ThemedText variant="labelSmall" colorName="textMuted" align="center" style={{ marginTop: Spacing.lg }}>
                        PuConnect {Platform.OS} · Version 1.0.4 (MVP)
                    </ThemedText>
                </Animated.View>
            </ScrollView>

            <PasswordResetModal
                isVisible={isResetModalVisible}
                onClose={() => setIsResetModalVisible(false)}
                initialEmail={user?.email}
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
        marginLeft: Spacing.xs,
    },
    menuGroup: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        ...Shadows.level1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuTextCol: {
        flex: 1,
        gap: 1,
    },
    menuItemTitle: {
        fontWeight: '600',
    },
    menuDivider: {
        height: 1,
        marginLeft: 72,
    },
    logoutWrapper: {
        marginTop: Spacing.xl * 1.5,
        paddingTop: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.1)',
    },
    logoutBtn: {
        height: 56,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
});
