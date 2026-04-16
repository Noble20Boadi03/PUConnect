import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useResponsive } from '@/hooks/use-responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfileViewModel } from '@/hooks/view-models/use-profile-view-model';
import { useAppAlert } from '@/context/alert-context';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';

export default function ProfileScreen() {
    const { uiState } = useProfileViewModel();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAppAlert();
    const { contentPaddingLeft, contentPaddingRight } = useResponsive();
    const tabBarHeight = useTabBarHeight();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };


    if (uiState.status === 'loading') {
        return (
            <ScreenLayout style={styles.centered}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenLayout>
        );
    }

    if (uiState.status === 'guest') {
        return (
            <ScreenLayout padding="none" withSafeArea={false}>
                <ThemedView 
                    style={[
                        styles.fixedHeader, 
                        { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }
                    ]}
                >
                    <View style={styles.topRow}>
                        <ThemedText variant="headlineSmall" style={styles.brandLogo}>
                            Connect<ThemedText colorName="primary">.</ThemedText>
                        </ThemedText>
                    </View>
                </ThemedView>

                <ThemedView style={styles.centered}>
                    <ThemedIcon name="account-circle-outline" size={64} colorName="outline" />
                    <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={{ marginTop: Spacing.md, paddingHorizontal: Spacing.xl }}>
                        Please sign in to view your profile and manage listings.
                    </ThemedText>
                    <PrimaryButton
                        title="Sign In"
                        onPress={() => router.push('/login')}
                        style={{ marginTop: Spacing.xl }}
                    />
                </ThemedView>
            </ScreenLayout>
        );
    }

    // uiState.status === 'content'
    const { data: user, isProfileIncomplete } = uiState;

    return (
        <ScreenLayout 
            scrollable={false}
            padding="none"
            withSafeArea={false}
        >
            {/* Header - Matches Universal Style */}
            <ThemedView 
                style={[
                    styles.fixedHeader, 
                    { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }
                ]}
            >
                    <View style={styles.topRow}>
                        <ThemedText variant="headlineSmall" style={styles.brandLogo}>
                            Profile<ThemedText colorName="primary">.</ThemedText>
                        </ThemedText>
                        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                            <Pressable style={styles.gridBtn} onPress={() => router.push('/settings')}>
                                <ThemedIcon name="cog-outline" size={22} colorName="text" />
                            </Pressable>
                        </View>
                    </View>
            </ThemedView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: tabBarHeight }}
            >
                {/* Hero Section - Redesigned to be cleaner */}
                <Animated.View 
                    entering={FadeInUp.delay(200).duration(800)}
                    style={[styles.heroSection, { backgroundColor: theme.surface }]}
                >
                    <View style={styles.headerInfo}>
                        <Link href={{ pathname: "/(tabs)/onboarding" }} asChild>
                            <Pressable style={[styles.avatarContainer, { borderColor: theme.surface, backgroundColor: theme.surfaceVariant }]}>
                                {user?.profilePictureUrl ? (
                                    <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                                ) : (
                                    <ThemedText variant="headlineLarge" colorName="primary" style={styles.avatarPlaceholder}>
                                        {user?.fullName?.charAt(0)}
                                    </ThemedText>
                                )}
                                {user?.verifiedStudent && (
                                    <View style={[styles.verifiedBadge, { backgroundColor: theme.primary, borderColor: theme.surface }]}>
                                        <ThemedIcon name="check-decagram" size={14} lightColor="#fff" darkColor="#fff" />
                                    </View>
                                )}
                                <View style={[styles.editBadge, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                                    <ThemedIcon name="camera" size={12} />
                                </View>
                            </Pressable>
                        </Link>

                        <View style={styles.userNameContainer}>
                            <ThemedText variant="titleLarge" style={styles.userName}>{user?.fullName || 'Campus Pro'}</ThemedText>
                            <ThemedText variant="bodySmall" colorName="textSecondary">
                                {user?.department || 'Student'} • Class of {user?.graduationYear || '2027'}
                            </ThemedText>
                            <View style={styles.roleRow}>
                                <View style={[styles.roleChip, { backgroundColor: theme.surfaceVariant, borderColor: theme.outlineVariant }]}>
                                    <ThemedText variant="labelSmall">Seeker</ThemedText>
                                </View>
                                {user?.canOfferServices ? (
                                    <View style={[styles.roleChip, { backgroundColor: theme.primaryContainer, borderColor: theme.primary }]}>
                                        <ThemedText variant="labelSmall" colorName="primary">Provider</ThemedText>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    {!user?.canOfferServices && (
                        <Link href={{ pathname: '/(tabs)/onboarding' }} asChild>
                            <Pressable style={[styles.providerBanner, { backgroundColor: theme.secondaryContainer, borderColor: theme.secondary }]}>
                                <ThemedIcon name="star-circle-outline" size={22} colorName="onSecondaryContainer" />
                                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                                    <ThemedText variant="labelLarge" colorName="onSecondaryContainer">Become a provider</ThemedText>
                                    <ThemedText variant="bodySmall" colorName="onSecondaryContainer" style={{ opacity: 0.9 }}>
                                        Add skills and campus details to post service offers.
                                    </ThemedText>
                                </View>
                                <ThemedIcon name="chevron-right" size={20} colorName="onSecondaryContainer" />
                            </Pressable>
                        </Link>
                    )}

                    <View style={[styles.statsOverview, { borderColor: theme.outlineVariant }]}>
                        <View style={styles.statBox}>
                            <ThemedText variant="titleMedium" colorName="primary">{user?.completedProjects || 0}</ThemedText>
                            <ThemedText variant="labelSmall" colorName="textMuted">Projects</ThemedText>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.outlineVariant }]} />
                        <View style={styles.statBox}>
                            <View style={styles.ratingRow}>
                                <ThemedIcon name="star" size={14} lightColor="#fbbf24" darkColor="#fbbf24" />
                                <ThemedText variant="titleSmall">{user?.reputationScore || '0.0'}</ThemedText>
                            </View>
                            <ThemedText variant="labelSmall" colorName="textMuted">Rating</ThemedText>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.outlineVariant }]} />
                        <View style={styles.statBox}>
                            <View style={[styles.statusDot, { backgroundColor: user?.isAvailable ? '#22c55e' : theme.outline }]} />
                            <ThemedText variant="labelSmall" colorName="textMuted">{user?.isAvailable ? 'Available' : 'Busy'}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <Link href={{ pathname: "/(tabs)/onboarding" }} asChild>
                            <Pressable style={[styles.halfBtn, { backgroundColor: theme.surfaceVariant, borderColor: theme.outlineVariant }]}>
                                <ThemedIcon name="pencil-outline" size={16} colorName="text" style={{ marginRight: 6 }} />
                                <ThemedText variant="labelLarge">Edit Profile</ThemedText>
                            </Pressable>
                        </Link>
                        <Link href={{ pathname: "/profile/[id]", params: { id: user?.id } }} asChild>
                            <Pressable style={[styles.halfBtn, { backgroundColor: theme.surfaceVariant, borderColor: theme.outlineVariant }]}>
                                <ThemedIcon name="eye-outline" size={16} colorName="text" style={{ marginRight: 6 }} />
                                <ThemedText variant="labelLarge">View Public</ThemedText>
                            </Pressable>
                        </Link>
                    </View>
                </Animated.View>

            {isProfileIncomplete && (
                <View style={[horizontalPadding, { marginBottom: Spacing.md }]}>
                    <Link href={{ pathname: "/(tabs)/onboarding" }} asChild>
                        <Pressable style={[styles.alertBanner, { backgroundColor: theme.primaryContainer, borderColor: theme.primary }]}>
                            <View style={[styles.alertIcon, { backgroundColor: theme.primary }]}>
                                <ThemedIcon name="creation" size={16} lightColor="#fff" darkColor="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ThemedText variant="labelLarge" colorName="onPrimaryContainer">Profile Strength: Low</ThemedText>
                                <ThemedText variant="bodySmall" colorName="onPrimaryContainer" style={{ opacity: 0.8 }}>Add a bio and skills to get noticed.</ThemedText>
                            </View>
                            <ThemedIcon name="chevron-right" size={18} colorName="onPrimaryContainer" />
                        </Pressable>
                    </Link>
                </View>
            )}

            {/* About & Skills Row */}
            <Animated.View entering={FadeInDown.delay(500).duration(800)} style={[styles.contentRow, { ...horizontalPadding, marginTop: Spacing.lg }]}>
                <View style={[styles.halfCard, { backgroundColor: theme.surface }]}>
                    <ThemedText variant="labelMedium" colorName="textMuted" style={styles.cardLabel}>About</ThemedText>
                    <ThemedText variant="bodySmall" colorName="textSecondary" numberOfLines={3}>
                        {user?.bio || 'No bio added yet. Tell people what you do!'}
                    </ThemedText>
                </View>
                <View style={[styles.halfCard, { backgroundColor: theme.surface }]}>
                    <ThemedText variant="labelMedium" colorName="textMuted" style={styles.cardLabel}>Skills</ThemedText>
                    <View style={styles.skillsPreview}>
                        {user?.skillTags && user.skillTags.length > 0 ? (
                            user.skillTags.slice(0, 3).map(tag => (
                                <View key={tag} style={[styles.miniTag, { backgroundColor: theme.surfaceVariant }]}>
                                    <ThemedText variant="labelSmall" numberOfLines={1}>{tag}</ThemedText>
                                </View>
                            ))
                        ) : (
                            <ThemedText variant="bodySmall" colorName="textMuted">None set</ThemedText>
                        )}
                        {user?.skillTags && user.skillTags.length > 3 && (
                            <ThemedText variant="labelSmall" colorName="primary">+{user.skillTags.length - 3} more</ThemedText>
                        )}
                    </View>
                </View>
            </Animated.View>

            {/* Grouped Settings Menu */}
            <Animated.View entering={FadeInDown.delay(600).duration(800)} style={[styles.menuWrapper, horizontalPadding, { marginBottom: tabBarHeight + Spacing.md }]}>
                <ThemedText variant="titleLarge" style={styles.sectionTitle}>Account</ThemedText>
                <View style={[styles.groupedMenu, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                    <Pressable style={styles.groupItem} onPress={() => router.push({ pathname: '/profile/my-listings', params: { tab: 'requests' } })}>
                        <View style={[styles.groupIcon, { backgroundColor: theme.primaryContainer }]}>
                            <ThemedIcon name="clipboard-text-outline" size={20} colorName="onPrimaryContainer" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText variant="titleMedium" style={styles.groupText}>My requests</ThemedText>
                            <ThemedText variant="bodySmall" colorName="textMuted">Need-help & service requests</ThemedText>
                        </View>
                        <ThemedIcon name="chevron-right" size={18} colorName="textMuted" />
                    </Pressable>

                    <View style={[styles.groupDivider, { backgroundColor: theme.outlineVariant }]} />

                    <Pressable style={styles.groupItem} onPress={() => router.push({ pathname: '/profile/my-listings', params: { tab: 'offers' } })}>
                        <View style={[styles.groupIcon, { backgroundColor: theme.primaryContainer }]}>
                            <ThemedIcon name="briefcase-outline" size={20} colorName="onPrimaryContainer" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText variant="titleMedium" style={styles.groupText}>My services</ThemedText>
                            <ThemedText variant="bodySmall" colorName="textMuted">Service offers you publish</ThemedText>
                        </View>
                        <ThemedIcon name="chevron-right" size={18} colorName="textMuted" />
                    </Pressable>
                    
                    <View style={[styles.groupDivider, { backgroundColor: theme.outlineVariant }]} />

                    <Pressable style={styles.groupItem} onPress={() => router.push('/settings')}>
                        <View style={[styles.groupIcon, { backgroundColor: theme.secondaryContainer }]}>
                            <ThemedIcon name="cog-outline" size={20} colorName="onSecondaryContainer" />
                        </View>
                        <ThemedText variant="titleMedium" style={styles.groupText}>Preferences</ThemedText>
                    </Pressable>
                </View>
            </Animated.View>
        </ScrollView>
    </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    },
    gridBtn: {
        padding: Spacing.xs,
    },
    heroSection: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginHorizontal: Spacing.xl,
        ...Shadows.level2,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        ...Shadows.level1,
    },
    avatarImage: {
        width: 74,
        height: 74,
        borderRadius: 37,
    },
    avatarPlaceholder: {
        fontWeight: '700',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    editBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    userNameContainer: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    userName: {
        fontWeight: '900',
        marginBottom: 2,
        letterSpacing: -0.5,
    },
    roleRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        flexWrap: 'wrap',
    },
    roleChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    providerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsOverview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        marginBottom: Spacing.md,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 30,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    halfBtn: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    alertIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentRow: {
        flexDirection: 'row',
        marginTop: Spacing.md,
        gap: 12,
    },
    halfCard: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        ...Shadows.level1,
    },
    cardLabel: {
        fontWeight: '800',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    skillsPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
    },
    miniTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    menuWrapper: {
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: Spacing.md,
        marginLeft: 4,
    },
    groupedMenu: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        ...Shadows.level2,
    },
    groupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    groupIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    groupText: {
        flex: 1,
        fontWeight: '600',
    },
    groupDivider: {
        height: 1,
        marginHorizontal: Spacing.md,
    },
});


