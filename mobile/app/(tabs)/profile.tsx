import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppRouter, useThemeColor, useThemeToggle, useChangeProfilePhoto, useTabBarHeight, usePullToRefreshOnHeader } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import {
  ProfileHeroSection,
  ProfileInfoRow,
  ProfileChangePhotoSheet,
  ProfilePhotoPreviewModal,
  ProfilePostsSection,
  ProfileReviewsSummaryRow,
  ProfileViewSkeleton,
} from '../../components/Profile';
import { NotificationBellButton } from '../../components/NotificationBellButton';
import { ServiceStatusButton } from '../../components/ServiceStatusButton';
import { TabHeader } from '../../components';
import { useAuthStore, useProfileStore, useUserProfileStore } from '../../store';
import { getAccountTypeLabel, getServiceOptionsByIds } from '../../lib';

export default function ProfileScreen() {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tabBarHeight = useTabBarHeight();
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const user = useAuthStore((s) => s.user);
  const isProvider = useProfileStore((s) => s.isProvider);
  const hydrated = useProfileStore((s) => s.hydrated);
  const hydrate = useProfileStore((s) => s.hydrate);
  const posts = useUserProfileStore((s) => s.posts);
  const receivedReviews = useUserProfileStore((s) => s.receivedReviews);
  const postsLoading = useUserProfileStore((s) => s.isLoading);
  const refreshing = useUserProfileStore((s) => s.isRefreshing);
  const fetchProfile = useUserProfileStore((s) => s.fetchProfile);

  // Compute review summary from receivedReviews
  const reviewSummary = receivedReviews.length === 0 
    ? { averageRating: 0, reviewCount: 0 }
    : {
        averageRating: Math.round((receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length) * 10) / 10,
        reviewCount: receivedReviews.length
      };

  const { iconName, handleToggle } = useThemeToggle();
  const {
    avatarUri,
    sheetVisible,
    previewVisible,
    previewUri,
    openSheet,
    closeSheet,
    closePreview,
    handleSheetSelect,
    handleConfirmPhoto,
    isLoading: photoUploading,
  } = useChangeProfilePhoto(user?.avatarUrl);

  useEffect(() => {
    void hydrate(user);
  }, [user, hydrate]);

  const onRefresh = useCallback(() => {
    if (user?.username) {
      fetchProfile(user.username, true);
    }
  }, [user?.username, fetchProfile]);

  const { panHandlers } = usePullToRefreshOnHeader({ onRefresh, isRefreshing: refreshing });

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const userSkills = user?.services && user.services.length > 0
    ? user.services.map((s) => s.title)
    : user?.serviceIds && user.serviceIds.length > 0
      ? getServiceOptionsByIds(user.serviceIds).map((s) => s.title)
      : user?.expertiseTags || [];

  const handleOpenSettings = () => {
    router.push('/settings' as any);
  };

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/post/${postId}?fromOwner=1` as any);
    },
    [router]
  );

  const handleEditInfo = useCallback(() => {
    router.push('/edit-info' as any);
  }, [router]);

  const handleBecomeProvider = useCallback(() => {
    router.push('/edit-info' as any);
  }, [router]);

  const handleOpenReviews = useCallback(() => {
    if (!user?.username) return;
    router.push(`/provider/${user.username}/reviews` as any);
  }, [user?.username, router]);

  if (!hydrated || postsLoading) {
    return <ProfileViewSkeleton />;
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: screenBg }]}>
      <View {...panHandlers}>
        <TabHeader
          title="Profile"
          rightActions={
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: subtleBg }]}
                onPress={handleToggle}
              >
                <Ionicons name={iconName} size={22} color={Colors.text} />
              </TouchableOpacity>
              <ServiceStatusButton backgroundColor={subtleBg} iconColor={Colors.text} size={44} />
              <NotificationBellButton backgroundColor={subtleBg} iconColor={Colors.text} size={44} />
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: subtleBg }]}
                onPress={handleOpenSettings}
              >
                <Ionicons name="settings-outline" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>
          }
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProfileHeroSection
          variant="owner"
          displayName={user?.name || 'User'}
          handle={user?.username ? `@${user.username}` : undefined}
          avatarUrl={avatarUri}
          initials={initials}
          cardBg={cardBg}
          subtleBg={subtleBg}
          primaryColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          isDark={isDark}
          onChangePhoto={openSheet}
          onEditInfo={handleEditInfo}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Information</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <ProfileInfoRow
            icon="at"
            iconColor={Colors.primary}
            iconBg={Colors.primary + '15'}
            label="Username"
            value={user?.username ? `@${user.username}` : 'Not set'}
            textColor={Colors.text}
            mutedColor={Colors.icon}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <ProfileInfoRow
            icon="mail-outline"
            iconColor={Colors.secondary}
            iconBg={Colors.secondary + '15'}
            label="Email Address"
            value={user?.email || 'Not set'}
            textColor={Colors.text}
            mutedColor={Colors.icon}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <ProfileInfoRow
            icon="shield-checkmark-outline"
            iconColor="#F59E0B"
            iconBg="#F59E0B15"
            label="Account Type"
            value={getAccountTypeLabel(user, isProvider)}
            textColor={Colors.text}
            mutedColor={Colors.icon}
          />
          {user?.role === 'admin' && (
            <>
              <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.replace('/(admin)/dashboard' as any)}
              >
                <Text style={[styles.adminButtonText, { color: Colors.primary }]}>Switch to Admin Module</Text>
              </TouchableOpacity>
            </>
          )}
          {isProvider && userSkills.length > 0 ? (
            <>
              <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
              <View style={styles.skillsBlock}>
                <View style={[styles.skillsIconCircle, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="sparkles-outline" size={18} color="#F59E0B" />
                </View>
                <View style={styles.skillsContent}>
                  <Text style={[styles.skillsLabel, { color: Colors.icon }]}>
                    {userSkills.length === 1 ? 'Service' : 'Services'}
                  </Text>
                  <View style={styles.skillsWrap}>
                    {userSkills.map((skill) => (
                      <View
                        key={skill}
                        style={[styles.skillPill, { backgroundColor: subtleBg }]}
                      >
                        <Text style={[styles.skillText, { color: Colors.text }]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </>
          ) : null}
          {isProvider ? (
            <>
              <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
              <ProfileReviewsSummaryRow
                averageRating={reviewSummary.averageRating}
                reviewCount={reviewSummary.reviewCount}
                textColor={Colors.text}
                mutedColor={Colors.icon}
                onPress={handleOpenReviews}
              />
            </>
          ) : null}
        </View>

        <ProfilePostsSection
        posts={posts}
        isProvider={isProvider}
        isOwnProfile={true}
        cardBg={cardBg}
        subtleBg={subtleBg}
        textColor={Colors.text}
        mutedColor={Colors.icon}
        primaryColor={Colors.primary}
        hideAuthorOnCards
        onPostPress={handlePostPress}
        onBecomeProvider={handleBecomeProvider}
      />
      </ScrollView>

      <ProfileChangePhotoSheet
        visible={sheetVisible}
        onClose={closeSheet}
        onSelect={handleSheetSelect}
      />
      {previewUri && (
        <ProfilePhotoPreviewModal
          visible={previewVisible}
          imageUri={previewUri}
          isLoading={photoUploading}
          onConfirm={handleConfirmPhoto}
          onCancel={closePreview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    marginTop: Spacing.lg + 4,
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: {
    height: 1,
    marginLeft: 54,
  },
  adminButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: 54,
  },
  adminButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  skillsBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md - 2,
    paddingVertical: Spacing.sm + 2,
  },
  skillsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContent: {
    flex: 1,
  },
  skillsLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillPill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  skillText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
});
