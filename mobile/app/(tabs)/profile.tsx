import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { PrimaryButton } from '@/components/ui/primary-button';

import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { useProfileViewModel } from '@/hooks/view-models/use-profile-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function ProfileScreen() {
    const { uiState } = useProfileViewModel();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { horizontalPadding } = useResponsive();
    const tabBarHeight = useTabBarHeight();

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
                {/* Brand Header */}
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
    const { data: user, isProfileIncomplete } = uiState;

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            {/* Header */}
            <ThemedView style={[styles.fixedHeader, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
                <View style={styles.topRow}>
                    <ThemedText variant="headlineSmall" style={styles.brandLogo}>
                        Profile<ThemedText colorName="primary">.</ThemedText>
                    </ThemedText>
                    <Pressable 
                        style={[styles.headerActionBtn, { backgroundColor: theme.surfaceVariant }]} 
                        onPress={() => router.push('/settings')}
                    >
                        <ThemedIcon name="cog-outline" size={22} />
                    </Pressable>
                </View>
            </ThemedView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.xl }}
            >
                {/* Hero / Identity Section */}
                <View style={[styles.heroCard, { backgroundColor: theme.surface, ...horizontalPadding }]}>
                    <View style={styles.identityRow}>
                        <View style={[styles.avatarFrame, { borderColor: theme.primaryContainer }]}>
                            {user?.profilePictureUrl ? (
                                <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surfaceVariant }]}>
                                    <ThemedText variant="headlineLarge" colorName="primary">
                                        {user?.fullName?.charAt(0) || '?'}
                                    </ThemedText>
                                </View>
                            )}
                            {user?.isAvailable && (
                                <View style={[styles.onlineIndicator, { backgroundColor: '#22c55e', borderColor: theme.surface }]} />
                            )}
                        </View>
                        
                        <View style={styles.identityInfo}>
                            <View style={styles.nameRow}>
                                <ThemedText variant="titleLarge" style={styles.fullName}>{user?.fullName}</ThemedText>
                                {user?.verifiedStudent && (
                                    <ThemedIcon name="check-decagram" size={20} colorName="primary" />
                                )}
                            </View>
                            <ThemedText variant="bodyMedium" colorName="textSecondary" style={styles.department}>
                                {user?.department || 'Member'} • Class of {user?.graduationYear || '—'}
                            </ThemedText>
                            
                            <View style={styles.chipRow}>
                                <View style={[styles.roleChip, { backgroundColor: theme.surfaceVariant }]}>
                                    <ThemedText variant="labelSmall">Seeker</ThemedText>
                                </View>
                                {user?.canOfferServices && (
                                    <View style={[styles.roleChip, { backgroundColor: theme.primaryContainer }]}>
                                        <ThemedText variant="labelSmall" colorName="onPrimaryContainer">Provider</ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Quick Access Actions */}
                    <View style={styles.heroActions}>
                        <Link href="/(tabs)/onboarding" asChild>
                            <Pressable style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
                                <ThemedIcon name="pencil" size={18} lightColor="#fff" darkColor="#fff" />
                                <ThemedText variant="labelLarge" style={styles.actionBtnText}>Edit Profile</ThemedText>
                            </Pressable>
                        </Link>
                        <Link href={{ pathname: "/profile/[id]", params: { id: user?.id } }} asChild>
                            <Pressable style={[styles.actionBtn, { backgroundColor: theme.surfaceVariant }]}>
                                <ThemedIcon name="eye-outline" size={18} />
                                <ThemedText variant="labelLarge" style={{ marginLeft: 6 }}>View Public</ThemedText>
                            </Pressable>
                        </Link>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={[styles.statsRow, horizontalPadding]}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                        <ThemedText variant="titleLarge" colorName="primary" style={styles.statVal}>
                            {user?.completedProjects || 0}
                        </ThemedText>
                        <ThemedText variant="labelSmall" colorName="textMuted">Projects</ThemedText>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                        <View style={styles.ratingBox}>
                            <ThemedIcon name="star" size={16} lightColor="#fbbf24" darkColor="#fbbf24" />
                            <ThemedText variant="titleLarge" style={[styles.statVal, { marginLeft: 4 }]}>
                                {user?.reputationScore || '5.0'}
                            </ThemedText>
                        </View>
                        <ThemedText variant="labelSmall" colorName="textMuted">Rating</ThemedText>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                        <ThemedText variant="titleLarge" colorName={user?.isAvailable ? "primary" : "textMuted"} style={styles.statVal}>
                            {user?.isAvailable ? 'Yes' : 'No'}
                        </ThemedText>
                        <ThemedText variant="labelSmall" colorName="textMuted">Available</ThemedText>
                    </View>
                </View>

                {/* Profile Strength / Warning */}
                {isProfileIncomplete && (
                    <View style={[styles.warningSection, horizontalPadding]}>
                        <Pressable 
                            style={[styles.warningCard, { backgroundColor: theme.secondaryContainer, borderColor: theme.secondary }]}
                            onPress={() => router.push('/(tabs)/onboarding')}
                        >
                            <ThemedIcon name="lightning-bolt" size={24} colorName="onSecondaryContainer" />
                            <View style={styles.warningTextContainer}>
                                <ThemedText variant="labelLarge" colorName="onSecondaryContainer">Complete your profile</ThemedText>
                                <ThemedText variant="bodySmall" colorName="onSecondaryContainer" style={{ opacity: 0.8 }}>
                                    Adding a bio and skills helps you get hired faster.
                                </ThemedText>
                            </View>
                            <ThemedIcon name="chevron-right" size={20} colorName="onSecondaryContainer" />
                        </Pressable>
                    </View>
                )}

                {/* Content Cards */}
                <View style={[styles.sectionsContainer, horizontalPadding]}>
                    <ThemedView style={[styles.contentCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                        <View style={styles.cardHeader}>
                            <ThemedIcon name="account-details-outline" size={20} colorName="primary" />
                            <ThemedText variant="titleMedium" style={styles.cardTitle}>Professional Bio</ThemedText>
                        </View>
                        <ThemedText variant="bodyMedium" colorName="textSecondary" style={styles.bioText}>
                            {user?.bio || "You haven't added a bio yet. Describe your professional background and what you can offer to the campus community."}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={[styles.contentCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                        <View style={styles.cardHeader}>
                            <ThemedIcon name="tag-outline" size={20} colorName="primary" />
                            <ThemedText variant="titleMedium" style={styles.cardTitle}>Skills & Expertise</ThemedText>
                        </View>
                        <View style={styles.skillsWrapper}>
                            {user?.skillTags && user.skillTags.length > 0 ? (
                                user.skillTags.map((tag) => (
                                    <View key={tag} style={[styles.skillBadge, { backgroundColor: theme.surfaceVariant }]}>
                                        <ThemedText variant="labelMedium">{tag}</ThemedText>
                                    </View>
                                ))
                            ) : (
                                <ThemedText variant="bodyMedium" colorName="textMuted" style={{ fontStyle: 'italic' }}>
                                    No skills listed.
                                </ThemedText>
                            )}
                        </View>
                    </ThemedView>
                </View>

                {/* Grouped Settings Menu - Inset Style */}
                <View style={[styles.menuContainer, horizontalPadding]}>
                    <ThemedText variant="labelLarge" colorName="textMuted" style={styles.menuLabel}>ACTIVITY & SETTINGS</ThemedText>
                    <ThemedView style={[styles.insetGroup, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                        <Pressable 
                            style={styles.menuItem} 
                            onPress={() => router.push({ pathname: '/profile/my-listings', params: { tab: 'requests' } })}
                        >
                            <View style={[styles.menuIconBox, { backgroundColor: theme.primaryContainer }]}>
                                <ThemedIcon name="clipboard-list-outline" size={20} colorName="onPrimaryContainer" />
                            </View>
                            <ThemedText variant="titleMedium" style={styles.menuItemText}>My Requests</ThemedText>
                            <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
                        </Pressable>
                        
                        <View style={[styles.menuDivider, { backgroundColor: theme.outlineVariant }]} />
                        
                        <Pressable 
                            style={styles.menuItem} 
                            onPress={() => router.push({ pathname: '/profile/my-listings', params: { tab: 'offers' } })}
                        >
                            <View style={[styles.menuIconBox, { backgroundColor: theme.tertiaryContainer }]}>
                                <ThemedIcon name="briefcase-outline" size={20} colorName="onTertiaryContainer" />
                            </View>
                            <ThemedText variant="titleMedium" style={styles.menuItemText}>My Services</ThemedText>
                            <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
                        </Pressable>
                        
                        <View style={[styles.menuDivider, { backgroundColor: theme.outlineVariant }]} />
                        
                        <Pressable 
                            style={styles.menuItem} 
                            onPress={() => router.push('/settings')}
                        >
                            <View style={[styles.menuIconBox, { backgroundColor: theme.secondaryContainer }]}>
                                <ThemedIcon name="cog-outline" size={20} colorName="onSecondaryContainer" />
                            </View>
                            <ThemedText variant="titleMedium" style={styles.menuItemText}>System Settings</ThemedText>
                            <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
                        </Pressable>
                    </ThemedView>
                </View>
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
        paddingBottom: Spacing.md,
        zIndex: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandLogo: {
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerActionBtn: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Guest View
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
    // Hero Section
    heroCard: {
        paddingVertical: Spacing.xl,
    },
    identityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarFrame: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        padding: 4,
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 3,
    },
    identityInfo: {
        flex: 1,
        marginLeft: Spacing.lg,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    fullName: {
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    department: {
        marginTop: 2,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: Spacing.md,
    },
    roleChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    heroActions: {
        flexDirection: 'row',
        marginTop: Spacing.xl,
        gap: Spacing.md,
    },
    actionBtn: {
        flex: 1,
        height: 48,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        marginLeft: 6,
        color: '#fff',
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.xl,
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
    },
    statVal: {
        fontWeight: '800',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Warning Section
    warningSection: {
        marginTop: Spacing.xl,
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    warningTextContainer: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    // Content Sections
    sectionsContainer: {
        marginTop: Spacing.xl,
        gap: Spacing.lg,
    },
    contentCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: 8,
    },
    cardTitle: {
        fontWeight: '700',
    },
    bioText: {
        lineHeight: 22,
    },
    skillsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
    },
    // Menu Container
    menuContainer: {
        marginTop: Spacing.xl * 1.5,
    },
    menuLabel: {
        marginBottom: Spacing.md,
        marginLeft: 4,
        letterSpacing: 1,
    },
    insetGroup: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        ...Shadows.level1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuItemText: {
        flex: 1,
        fontWeight: '600',
    },
    menuDivider: {
        height: 1,
        marginHorizontal: Spacing.lg,
    },
});
