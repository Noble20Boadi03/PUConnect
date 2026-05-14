import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Image, ScrollView, Dimensions, Modal, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ListingCard } from '@/components/listing-card';
import { RequestCard } from '@/components/request-card';

import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { useProfileViewModel } from '@/hooks/view-models/use-profile-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useAuth } from '@/context/auth-context';
import { useAppAlert } from '@/context/alert-context';
import { api } from '@/services/api';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const { uiState, handleRefresh } = useProfileViewModel();
    const { token, refreshUser } = useAuth();
    const { theme, isDark } = useTheme();
    const { showAlert } = useAppAlert();
    const { showActionSheetWithOptions } = useActionSheet();
    const insets = useSafeAreaInsets();
    const { horizontalPadding, isTablet, isLandscape } = useResponsive();
    const tabBarHeight = useTabBarHeight();

    const [activeTab, setActiveTab] = useState<'posts' | 'skills'>('posts');
    const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // ── Grid Layout Calculation ───────────────────────────────────────────
    const cardWidth = useMemo(() => {
        const padding = horizontalPadding.paddingLeft + horizontalPadding.paddingRight;
        if (isTablet) return (SCREEN_WIDTH - padding - Spacing.md) / 2;
        if (isLandscape) return (SCREEN_WIDTH - padding - Spacing.md * 2) / 3;
        return SCREEN_WIDTH - padding;
    }, [horizontalPadding, isTablet, isLandscape]);

    // ── LISTING FILTERING ────────────────────────────────────────────────
    const filteredListings = useMemo(() => {
        if (uiState.status !== 'content') return [];
        return uiState.listings.filter(l => 
            activeTab === 'posts' ? l.type === 'service_request' : l.type === 'service_offer'
        );
    }, [uiState, activeTab]);

    // ── SET PHOTO: Pick from library ────────────────────────────────────────
    const pickFromLibrary = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert({ title: 'Permission Required', subtitle: 'Please allow access to your photo library to set a profile picture.', severity: 'warning' });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            setPendingPhoto(result.assets[0].uri);
        }
    }, [showAlert]);

    // ── SET PHOTO: Take a photo ─────────────────────────────────────────────
    const takePhoto = useCallback(async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            showAlert({ title: 'Permission Required', subtitle: 'Please allow camera access to take a profile picture.', severity: 'warning' });
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            setPendingPhoto(result.assets[0].uri);
        }
    }, [showAlert]);

    // ── SET PHOTO: Action sheet ──────────────────────────────────────────────
    const handleSetPhoto = useCallback(() => {
        const options = ['Choose from Library', 'Take a Photo', 'Cancel'];
        const cancelButtonIndex = 2;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
                title: 'Set Profile Photo',
                message: 'Choose a source for your new profile picture',
            },
            (buttonIndex) => {
                if (buttonIndex === 0) pickFromLibrary();
                else if (buttonIndex === 1) takePhoto();
            }
        );
    }, [showActionSheetWithOptions, pickFromLibrary, takePhoto]);

    // ── SET PHOTO: Confirm & upload ─────────────────────────────────────────
    const confirmPhoto = useCallback(async () => {
        if (!pendingPhoto || !token) return;
        setIsUploading(true);
        try {
            let finalImageUrl = pendingPhoto;

            // Upload if it's a local file
            if (pendingPhoto.startsWith('file://')) {
                // Simulate upload but keep local file URI for mock UI rendering
                await api.uploadImage(pendingPhoto, token);
                finalImageUrl = pendingPhoto;
            }

            await api.updateProfile({ profilePictureUrl: finalImageUrl }, token);
            await refreshUser();

            setPendingPhoto(null);
            showAlert({ title: 'Photo Updated', subtitle: 'Your profile picture has been updated successfully!', severity: 'success' });
        } catch (error) {
            console.error('Set photo error:', error);
            showAlert({ title: 'Upload Failed', subtitle: 'Could not update your profile picture. Please try again.', severity: 'error' });
        } finally {
            setIsUploading(false);
        }
    }, [pendingPhoto, token, refreshUser, showAlert]);

    // ── LOADING STATE ───────────────────────────────────────────────────────
    if (uiState.status === 'loading') {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    // ── ERROR STATE ──────────────────────────────────────────────────────────
    if (uiState.status === 'error') {
        return (
            <ThemedView style={styles.centered}>
                <ThemedIcon name="alert-circle-outline" size={48} colorName="error" />
                <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={{ marginTop: Spacing.md }}>
                    {uiState.message}
                </ThemedText>
            </ThemedView>
        );
    }

    // ── CONTENT STATE ───────────────────────────────────────────────────────
    const { data: user, isRefreshingListings } = uiState;
    const isAdmin = user?.role === 'admin';

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            {/* ─── HEADER BAR ────────────────────────────────── */}
            <ThemedView style={[styles.fixedHeader, { paddingTop: insets.top + Spacing.xs, ...horizontalPadding }]}>
                <View style={styles.topRow}>
                    <ThemedText variant="headlineSmall" style={[styles.brandLogo, { fontWeight: '900' }]}>
                        Profile<ThemedText colorName="primary" style={{ fontWeight: '900' }}></ThemedText>
                    </ThemedText>
                    <View style={styles.headerActions}>
                        {isAdmin && (
                            <Pressable
                                style={styles.iconBtn}
                                onPress={() => router.push('/(tabs)/admin')}
                            >
                                <ThemedIcon name="shield-check-outline" size={24} />
                            </Pressable>
                        )}
                        <Pressable
                            style={styles.iconBtn}
                            onPress={() => router.push('/notifications')}
                        >
                            <ThemedIcon name="bell-outline" size={24} />
                        </Pressable>
                    </View>
                </View>
            </ThemedView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.xl }}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefreshingListings} 
                        onRefresh={handleRefresh} 
                        tintColor={theme.primary} 
                    />
                }
            >
                {/* ─── AVATAR + IDENTITY ──────────────────────── */}
                <View style={styles.heroSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarGradientRing, { borderColor: theme.primary }]}>
                            <View style={[styles.avatarInnerRing, { backgroundColor: theme.background }]}>
                                {user?.profilePictureUrl ? (
                                    <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primaryContainer }]}>
                                        <ThemedText
                                            variant="displaySmall"
                                            colorName="primary"
                                            style={{ fontWeight: '700', fontSize: 44 }}
                                        >
                                            {user?.fullName?.charAt(0) || '?'}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <ThemedText variant="headlineSmall" style={styles.displayName}>
                        {user?.fullName || 'User'}
                    </ThemedText>
                </View>

                {/* ─── ACTION BUTTONS ROW ─────────────────────── */}
                <View style={[styles.actionRow, horizontalPadding]}>
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
                        onPress={handleSetPhoto}
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

                    {user?.canOfferServices && (
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
                            onPress={() => router.push('/profile/public-profile')}
                        >
                            <View style={[styles.actionBtnIcon, { backgroundColor: theme.surfaceVariant }]}>
                                <ThemedIcon name="card-account-details-outline" size={22} colorName="onSurfaceVariant" />
                            </View>
                            <ThemedText variant="labelSmall" colorName="textSecondary" style={styles.actionBtnLabel}>
                                View Profile
                            </ThemedText>
                        </Pressable>
                    )}

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
                </View>

                {/* ─── INFO CARD ──────────────────────────────── */}
                <View
                    style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }, horizontalPadding]}
                >
                    <View style={styles.infoCardInner}>
                        {/* Username row */}
                        <View style={styles.infoRowColumn}>
                            <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.xs }}>
                                Username
                            </ThemedText>
                            <ThemedText variant="bodyLarge" style={styles.infoValue}>
                                @{user?.username || 'username'}
                            </ThemedText>
                        </View>

                        <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />

                        {/* Email row */}
                        <View style={styles.infoRowColumn}>
                            <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.xs }}>
                                Email Address
                            </ThemedText>
                            <ThemedText variant="bodyLarge" style={styles.infoValue}>
                                {user?.email || '—'}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* ─── TABS: Posts / Skill Ads ───────────── */}
                <View style={styles.tabSection}>
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

                        {/* 
                          * Skill Ads Tab: Hidden by default. 
                          * Only visible after account upgrade to provider status (canOfferServices: true).
                          */}
                        {user?.canOfferServices && (
                            <Pressable
                                style={[
                                    styles.tab,
                                    activeTab === 'skills' && {
                                        backgroundColor: isDark ? 'rgba(165,180,252,0.15)' : 'rgba(79,70,229,0.1)',
                                        borderColor: theme.primary,
                                    },
                                    activeTab !== 'skills' && {
                                        borderColor: 'transparent',
                                    },
                                ]}
                                onPress={() => setActiveTab('skills')}
                            >
                                <ThemedText
                                    variant="labelLarge"
                                    colorName={activeTab === 'skills' ? 'primary' : 'textMuted'}
                                    style={styles.tabLabel}
                                >
                                    Active services
                                </ThemedText>
                            </Pressable>
                        )}
                    </View>

                    {/* Content Feed */}
                    {filteredListings.length > 0 ? (
                        <View style={[styles.listingsGrid, horizontalPadding]}>
                            {filteredListings.map(listing => (
                                <View key={listing.id} style={{ width: cardWidth }}>
                                    {listing.type === 'service_request' ? (
                                        <RequestCard 
                                            listing={listing} 
                                            width={cardWidth} 
                                            onPress={() => router.push({ pathname: '/listing/[id]', params: { id: listing.id } })}
                                        />
                                    ) : (
                                        <ListingCard 
                                            listing={listing} 
                                            width={cardWidth} 
                                            onPress={() => router.push({ pathname: '/listing/[id]', params: { id: listing.id } })}
                                        />
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        /* Empty state */
                        <View style={styles.emptyState}>
                            <View style={[styles.illustrationContainer, { backgroundColor: theme.primaryContainer + '20' }]}>
                                <ThemedIcon 
                                    name={activeTab === 'posts' ? "post-outline" : "bullhorn-outline"} 
                                    size={64} 
                                    colorName="primary" 
                                />
                            </View>
                            <ThemedText variant="titleLarge" style={[styles.emptyTitle, { marginTop: Spacing.xl }]}>
                                {activeTab === 'posts' ? "No posts yet" : "No skill ads yet"}
                            </ThemedText>
                            <ThemedText variant="bodyLarge" colorName="textMuted" align="center" style={styles.emptySubtitle}>
                                {activeTab === 'posts' 
                                    ? "Post about anything you need help with so that providers can assist you when they see your request."
                                    : "As a provider, you can create ads for your services so that other students can discover and hire you."
                                }
                            </ThemedText>

                            <PrimaryButton
                                title={activeTab === 'posts' ? "Add a post" : "Create a skill ad"}
                                onPress={() => router.push(activeTab === 'posts' ? '/listing/create' : '/listing/create?type=skill')}
                                style={styles.addPostBtn}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ─── PHOTO CONFIRMATION MODAL ─────────────────── */}
            <Modal
                visible={!!pendingPhoto}
                transparent
                animationType="fade"
                onRequestClose={() => setPendingPhoto(null)}
            >
                <BlurView intensity={isDark ? 50 : 25} tint={isDark ? 'dark' : 'light'} style={styles.photoModalOverlay}>
                    <View style={[styles.photoModalContent, { backgroundColor: theme.surface }]}>
                        <ThemedText variant="headlineSmall" style={styles.photoModalTitle}>
                            Confirm Profile Photo
                        </ThemedText>
                        <ThemedText variant="bodyMedium" colorName="textMuted" style={styles.photoModalSubtitle}>
                            This will be your new profile picture
                        </ThemedText>

                        {/* Preview */}
                        <View style={styles.photoPreviewWrapper}>
                            <View style={[styles.photoPreviewRing, { borderColor: theme.primary }]}>
                                <View style={[styles.photoPreviewInner, { backgroundColor: theme.surface }]}>
                                    {pendingPhoto && (
                                        <Image source={{ uri: pendingPhoto }} style={styles.photoPreviewImage} />
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Action buttons */}
                        <View style={styles.photoModalActions}>
                            <PrimaryButton
                                title={isUploading ? 'Uploading...' : 'Use This Photo'}
                                onPress={confirmPhoto}
                                isLoading={isUploading}
                                style={{ width: '100%' }}
                            />
                        </View>
                        <Pressable
                            onPress={() => setPendingPhoto(null)}
                            style={styles.photoModalCancel}
                            disabled={isUploading}
                        >
                            <ThemedText variant="labelLarge" colorName="textMuted" style={{ fontWeight: '600' }}>
                                Cancel
                            </ThemedText>
                        </Pressable>
                    </View>
                </BlurView>
            </Modal>
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
        paddingBottom: Spacing.xs,
        zIndex: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    brandLogo: {
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    iconBtn: {
        padding: Spacing.xs,
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
        borderWidth: 3,
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
    // Action Buttons Row
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: Spacing.lg,
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: 2,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        minWidth: (SCREEN_WIDTH - 64) / 4, // Dynamic adjustment for 4 buttons
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
        fontSize: 11,
        textAlign: 'center',
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
    infoRowColumn: {
        paddingVertical: Spacing.md,
    },
    infoValue: {
        fontWeight: '700',
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

    // Listings Grid
    listingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        paddingBottom: Spacing.xl,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.huge,
        paddingHorizontal: Spacing.xl,
    },
    illustrationContainer: {
        width: 120,        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
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

    // Photo Confirmation Modal
    photoModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    photoModalContent: {
        width: '100%',
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    photoModalTitle: {
        fontWeight: '800',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    photoModalSubtitle: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    photoPreviewWrapper: {
        marginBottom: Spacing.xl,
    },
    photoPreviewRing: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    photoPreviewInner: {
        width: 188,
        height: 188,
        borderRadius: 94,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoPreviewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 92,
    },
    photoModalActions: {
        width: '100%',
    },
    photoModalCancel: {
        marginTop: Spacing.lg,
        padding: Spacing.sm,
    },
});
