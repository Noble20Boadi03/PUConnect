import React from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Stack as ExpoStack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';

import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';

import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { useAuth } from '@/context/auth-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { ThemedIcon } from '@/components/ui/themed-icon';



export default function PublicProfileScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();

    const { horizontalPadding } = useResponsive();

    if (!user) return null;

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            <ExpoStack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <ScreenHeader title="Provider Profile" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Spacing.xxl }}
            >
                {/* ─── AVATAR + IDENTITY ──────────────────────── */}
                <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
                    <View style={styles.avatarWrapper}>
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
                    <ThemedText variant="bodyMedium" colorName="primary" style={{ marginTop: 4, fontWeight: '600' }}>
                        {user.category || "Verified Provider"}
                    </ThemedText>
                </Animated.View>

                {/* ─── PROVIDER INFO CARD ──────────────────────────────── */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(600)}
                    style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }, horizontalPadding]}
                >
                    <View style={styles.infoCardInner}>
                        {/* Username row */}
                        <View style={styles.infoRow}>
                            <ThemedText variant="bodyLarge" style={styles.infoValue}>
                                @{user.username || user.fullName?.toLowerCase().replace(/\s+/g, '_') || 'user'}
                            </ThemedText>
                            <ThemedText variant="bodySmall" colorName="textMuted">
                                Username
                            </ThemedText>
                        </View>

                        {user?.bio && (
                            <>
                                <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />
                                <View style={styles.infoRowColumn}>
                                    <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.xs }}>
                                        About Me
                                    </ThemedText>
                                    <ThemedText variant="bodyMedium" style={{ lineHeight: 22 }}>
                                        {user.bio}
                                    </ThemedText>
                                </View>
                            </>
                        )}

                        {user?.skillTags && user.skillTags.length > 0 && (
                            <>
                                <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />
                                <View style={styles.infoRowColumn}>
                                    <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.sm }}>
                                        Offered Services & Skills
                                    </ThemedText>
                                    <View style={styles.skillsContainer}>
                                        {user.skillTags.map((skill, index) => (
                                            <View key={index} style={[styles.skillChip, { backgroundColor: theme.primaryContainer }]}>
                                                <ThemedText variant="labelMedium" colorName="onPrimaryContainer">{skill}</ThemedText>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* ─── SKILL ADS SECTION ───────────── */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={[styles.adsSection, horizontalPadding]}>
                    <ThemedText variant="titleMedium" style={styles.adsSectionTitle}>
                        Skill Ads
                    </ThemedText>

                    {/* Empty state for now */}
                    <View style={[styles.emptyState, { backgroundColor: theme.surfaceVariant }]}>
                        <ThemedIcon name="bullhorn-outline" size={48} colorName="textMuted" />
                        <ThemedText variant="titleMedium" style={styles.emptyTitle}>
                            No active ads
                        </ThemedText>
                        <ThemedText variant="bodyMedium" colorName="textMuted" align="center" style={styles.emptySubtitle}>
                            This provider currently doesn&apos;t have any active skill ads posted.
                        </ThemedText>
                    </View>
                </Animated.View>

            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    heroSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    avatarWrapper: {
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    avatarGradientRing: {
        padding: 4,
        borderRadius: 999,
    },
    avatarInnerRing: {
        padding: 4,
        borderRadius: 999,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    displayName: {
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    infoCard: {
        marginHorizontal: 16,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        marginBottom: Spacing.xl,
        ...Shadows.level1,
    },
    infoCardInner: {
        padding: Spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    infoRowColumn: {
        paddingVertical: Spacing.xs,
    },
    infoValue: {
        fontWeight: '600',
    },
    infoDivider: {
        height: 1,
        width: '100%',
        marginVertical: Spacing.md,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    skillChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    adsSection: {
        marginTop: Spacing.md,
        paddingHorizontal: 16,
    },
    adsSectionTitle: {
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    emptyState: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xs,
    },
    emptyTitle: {
        fontWeight: '600',
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    emptySubtitle: {
        maxWidth: '80%',
    },
});
