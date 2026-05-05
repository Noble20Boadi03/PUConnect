import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Image, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { PrimaryButton } from '@/components/ui/primary-button';

import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { useProfileViewModel } from '@/hooks/view-models/use-profile-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useAuth } from '@/context/auth-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const { uiState } = useProfileViewModel();
    const { signOut } = useAuth();
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { horizontalPadding } = useResponsive();
    const tabBarHeight = useTabBarHeight();

    const [activeTab, setActiveTab] = useState<'posts' | 'archived'>('posts');

    // ── LOADING STATE ───────────────────────────────────────────────────────
    if (uiState.status === 'loading') {
        return (
            <ScreenLayout style={styles.centered}>
                <ActivityIndicator size="large" color={theme.primary} />
                <ThemedText variant="bodyMedium" colorName="textMuted" style={{ marginTop: Spacing.md }}>
                    Loading profile...
                </ThemedText>
            </ScreenLayout>
        );
    }

    // ── GUEST STATE ─────────────────────────────────────────────────────────
    if (uiState.status === 'guest') {
        return (
            <ScreenLayout padding="none" withSafeArea={false}>
                <ThemedView style={[styles.fixedHeader, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
                    <View style={styles.topRow}>
                        <ThemedText variant="headlineSmall" style={styles.brandLogo}>
                            PUConnect<ThemedText colorName="primary">.</ThemedText>
                        </ThemedText>
                    </View>
                </ThemedView>

                <View style={styles.guestContent}>
                    <View style={[styles.guestIconContainer, { backgroundColor: theme.surfaceVariant }]}>
                        <ThemedIcon name="account-lock-outline" size={60} colorName="primary" />
                    </View>
                    <ThemedText variant="headlineSmall" style={styles.guestTitle}>Join the Community</ThemedText>
                    <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={styles.guestSubtitle}>
                        Sign in to showcase your skills, manage your requests, and connect with peers across campus.
                    </ThemedText>
                    <PrimaryButton
                        title="Sign In to Continue"
                        onPress={() => router.push('/login')}
                        style={styles.guestBtn}
                    />
                    <Pressable onPress={() => router.push('/register')} style={{ marginTop: Spacing.xl }}>
                        <ThemedText variant="labelLarge" colorName="primary">Don&apos;t have an account? Sign Up</ThemedText>
                    </Pressable>
                </View>
            </ScreenLayout>
        );
    }

    // ── CONTENT STATE ───────────────────────────────────────────────────────
    const { data: user } = uiState;

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            {/* ─── HEADER BAR ────────────────────────────────── */}
            <ThemedView style={[styles.fixedHeader, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
                <View style={styles.topRow}>
                    <Pressable style={styles.headerIconBtn} hitSlop={8}>
                        <ThemedIcon name="view-grid-outline" size={24} colorName="text" />
                    </Pressable>
                    <Pressable style={styles.headerIconBtn} hitSlop={8}>
                        <ThemedIcon name="dots-vertical" size={24} colorName="text" />
                    </Pressable>
                </View>
            </ThemedView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.xl }}
            >
                {/* ─── AVATAR + IDENTITY ──────────────────────── */}
                <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
                    <View style={styles.avatarWrapper}>
                        {/* Outer glow */}
                        <LinearGradient
                            colors={isDark
                                ? ['#c084fc', '#7c3aed', '#4c1d95'] as const
                                : ['#e9d5ff', '#8b5cf6', '#5b21b6'] as const
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.avatarGradientRing}
                        >
                            <View style={[styles.avatarInnerRing, { backgroundColor: theme.background }]}>
                                {user?.profilePictureUrl ? (
                                    <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                                ) : (
                                    <LinearGradient
                                        colors={isDark
                                            ? ['#7c3aed', '#6d28d9'] as const
                                            : ['#a78bfa', '#7c3aed'] as const
                                        }
                                        style={styles.avatarPlaceholder}
                                    >
                                        <ThemedText
                                            variant="displaySmall"
                                            lightColor="#fff"
                                            darkColor="#fff"
                                            style={{ fontWeight: '700', fontSize: 44 }}
                                        >
                                            {user?.fullName?.charAt(0) || '?'}
                                        </ThemedText>
                                    </LinearGradient>
                                )}
                            </View>
                        </LinearGradient>
                    </View>

                    <ThemedText variant="headlineSmall" style={styles.displayName}>
                        {user?.fullName || 'User'}
                    </ThemedText>
                    <ThemedText variant="bodyMedium" style={styles.onlineStatus}>
                        online
                    </ThemedText>
                </Animated.View>

                {/* ─── ACTION BUTTONS ROW ─────────────────────── */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={[styles.actionRow, horizontalPadding]}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionBtn,
                            {
                                backgroundColor: pressed
                                    ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)')
                                    : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)'),
                                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                        onPress={() => router.push('/profile/edit-profile')}
                    >
                        <View style={[styles.actionBtnIcon, { backgroundColor: theme.primaryContainer }]}>
                            <ThemedIcon name="camera-plus-outline" size={22} colorName="onPrimaryContainer" />
                        </View>
                        <ThemedText variant="labelSmall" colorName="textSecondary" style={styles.actionBtnLabel}>
                            Set Photo
                        </ThemedText>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.actionBtn,
                            {
                                backgroundColor: pressed
                                    ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)')
                                    : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)'),
                                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                        onPress={() => router.push('/profile/edit-profile')}
                    >
                        <View style={[styles.actionBtnIcon, { backgroundColor: theme.secondaryContainer }]}>
                            <ThemedIcon name="pencil-outline" size={22} colorName="onSecondaryContainer" />
                        </View>
                        <ThemedText variant="labelSmall" colorName="textSecondary" style={styles.actionBtnLabel}>
                            Edit Info
                        </ThemedText>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.actionBtn,
                            {
                                backgroundColor: pressed
                                    ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)')
                                    : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)'),
                                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                        onPress={() => router.push('/profile/settings')}
                    >
                        <View style={[styles.actionBtnIcon, { backgroundColor: theme.tertiaryContainer }]}>
                            <ThemedIcon name="cog-outline" size={22} colorName="onTertiaryContainer" />
                        </View>
                        <ThemedText variant="labelSmall" colorName="textSecondary" style={styles.actionBtnLabel}>
                            Settings
                        </ThemedText>
                    </Pressable>
                </Animated.View>

                {/* ─── INFO CARD ──────────────────────────────── */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(600)}
                    style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }, horizontalPadding]}
                >
                    <View style={styles.infoCardInner}>
                        {/* Phone / Email row */}
                        <View style={styles.infoRow}>
                            <ThemedText variant="bodyLarge" style={styles.infoValue}>
                                {user?.email || '—'}
                            </ThemedText>
                            <ThemedText variant="bodySmall" colorName="textMuted">
                                Email
                            </ThemedText>
                        </View>

                        <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />

                        {/* Username row */}
                        <View style={styles.infoRow}>
                            <ThemedText variant="bodyLarge" style={styles.infoValue}>
                                @{user?.fullName?.toLowerCase().replace(/\s+/g, '_') || 'user'}
                            </ThemedText>
                            <ThemedText variant="bodySmall" colorName="textMuted">
                                Username
                            </ThemedText>
                        </View>

                        {user?.department && (
                            <>
                                <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />
                                <View style={styles.infoRow}>
                                    <ThemedText variant="bodyLarge" style={styles.infoValue}>
                                        {user.department}{user.graduationYear ? ` · Class of ${user.graduationYear}` : ''}
                                    </ThemedText>
                                    <ThemedText variant="bodySmall" colorName="textMuted">
                                        Department
                                    </ThemedText>
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* ─── TABS: Posts / Archived Posts ───────────── */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.tabSection}>
                    <View style={styles.tabBar}>
                        <Pressable
                            style={[
                                styles.tab,
                                activeTab === 'posts' && {
                                    backgroundColor: isDark ? 'rgba(165,180,252,0.15)' : 'rgba(79,70,229,0.1)',
                                    borderColor: theme.primary,
                                },
                                activeTab !== 'posts' && {
                                    borderColor: 'transparent',
                                },
                            ]}
                            onPress={() => setActiveTab('posts')}
                        >
                            <ThemedText
                                variant="labelLarge"
                                colorName={activeTab === 'posts' ? 'primary' : 'textMuted'}
                                style={styles.tabLabel}
                            >
                                Posts
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.tab,
                                activeTab === 'archived' && {
                                    backgroundColor: isDark ? 'rgba(165,180,252,0.15)' : 'rgba(79,70,229,0.1)',
                                    borderColor: theme.primary,
                                },
                                activeTab !== 'archived' && {
                                    borderColor: 'transparent',
                                },
                            ]}
                            onPress={() => setActiveTab('archived')}
                        >
                            <ThemedText
                                variant="labelLarge"
                                colorName={activeTab === 'archived' ? 'primary' : 'textMuted'}
                                style={styles.tabLabel}
                            >
                                Archived Posts
                            </ThemedText>
                        </Pressable>
                    </View>

                    {/* Empty state */}
                    <View style={styles.emptyState}>
                        <ThemedText variant="headlineSmall" style={styles.emptyTitle}>
                            No posts yet...
                        </ThemedText>
                        <ThemedText variant="bodyMedium" colorName="textMuted" align="center" style={styles.emptySubtitle}>
                            Publish photos and videos to display on{'\n'}your profile page
                        </ThemedText>

                        <PrimaryButton
                            title="Add a post"
                            onPress={() => router.push('/listing/create')}
                            style={styles.addPostBtn}
                        />
                    </View>
                </Animated.View>
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fixedHeader: {
        paddingBottom: Spacing.sm,
        zIndex: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandLogo: {
        fontWeight: '800',
        letterSpacing: -0.5,
    },

    // Guest
    guestContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl * 1.5,
    },
    guestIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    guestTitle: {
        fontWeight: '800',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    guestSubtitle: {
        lineHeight: 24,
        marginBottom: Spacing.xl * 1.5,
    },
    guestBtn: {
        width: '100%',
        height: 56,
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    avatarWrapper: {
        marginBottom: Spacing.md,
    },
    avatarGradientRing: {
        width: 130,
        height: 130,
        borderRadius: 65,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInnerRing: {
        width: 122,
        height: 122,
        borderRadius: 61,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    displayName: {
        fontWeight: '800',
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    onlineStatus: {
        color: '#22c55e',
        fontWeight: '500',
        fontSize: 14,
    },

    // Action Buttons Row
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: Spacing.lg,
    },
    actionBtn: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        minWidth: (SCREEN_WIDTH - 48 - 24) / 3,
    },
    actionBtnIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    actionBtnLabel: {
        fontWeight: '600',
        fontSize: 12,
    },

    // Info Card
    infoCard: {
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        marginTop: Spacing.sm,
        ...Shadows.level1,
    },
    infoCardInner: {
        padding: Spacing.lg,
    },
    infoRow: {
        paddingVertical: Spacing.md,
    },
    infoValue: {
        fontWeight: '600',
        marginBottom: 2,
    },
    infoDivider: {
        height: 1,
    },

    // Tabs
    tabSection: {
        marginTop: Spacing.xl,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    tab: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
    },
    tabLabel: {
        fontWeight: '600',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl * 1.5,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    emptyTitle: {
        fontWeight: '800',
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    addPostBtn: {
        paddingHorizontal: Spacing.xxl,
        height: 48,
    },
});
