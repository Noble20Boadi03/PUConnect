import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppRouter, useThemeColor, useThemeToggle, useChangeProfilePhoto } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import {
  ProfileHeroSection,
  ProfileInfoRow,
  ProfileChangePhotoSheet,
  ProfilePostsSection,
  ProfileReviewsSummaryRow,
  ProfileViewSkeleton,
} from '../../components/Profile';
import { NotificationBellButton } from '../../components/NotificationBellButton';
import { useAuthStore, useProfileStore } from '../../store';
import {
  selectSummaryForProvider,
  useProviderReviewsStore,
} from '../../store/providerReviewsStore';
import { getAccountTypeLabel } from '../../lib';
import { mapDbPostToFeaturedPost } from '../../lib/mapDbPost';
import { profileService } from '../../services';
import type { FeaturedPost } from '../../types';

export default function ProfileScreen() {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const user = useAuthStore((s) => s.user);
  const isProvider = useProfileStore((s) => s.isProvider);
  const hydrated = useProfileStore((s) => s.hydrated);
  const hydrate = useProfileStore((s) => s.hydrate);

  const [posts, setPosts] = useState<FeaturedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const submittedReviews = useProviderReviewsStore((s) => s.submittedReviews);

  const reviewSummary = useMemo(() => {
    if (!user?.username) return { averageRating: 0, reviewCount: 0 };
    return selectSummaryForProvider(submittedReviews, user.username);
  }, [user?.username, submittedReviews]);

  const { iconName, handleToggle } = useThemeToggle();
  const { avatarUri, sheetVisible, openSheet, closeSheet, handleSheetSelect } =
    useChangeProfilePhoto(user?.avatarUrl);

  useEffect(() => {
    void hydrate(user);
  }, [user, hydrate]);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (!user?.username) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setPostsLoading(true);
    }

    try {
      const profile = await profileService.getPublicProfile(user.username);
      const apiPosts = Array.isArray(profile?.posts) ? profile.posts : [];
      setPosts(apiPosts.map(mapDbPostToFeaturedPost));
    } catch (error) {
      console.error('Error fetching profile posts:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
      setRefreshing(false);
    }
  }, [user?.username]);

  const onRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings' as any);
  };

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/post/${postId}?fromOwner=1` as any);
    },
    [router]
  );

  const handleEditInfo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/edit-info' as any);
  }, [router]);

  const handleBecomeProvider = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/edit-info' as any);
  }, [router]);

  const handleOpenReviews = useCallback(() => {
    if (!user?.username) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/provider/${user.username}/reviews` as any);
  }, [user?.username, router]);

  if (!hydrated || postsLoading) {
    return <ProfileViewSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: subtleBg }]}
            onPress={handleToggle}
          >
            <Ionicons name={iconName} size={22} color={Colors.text} />
          </TouchableOpacity>
          <NotificationBellButton backgroundColor={subtleBg} iconColor={Colors.text} />
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: subtleBg }]}
            onPress={handleOpenSettings}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
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
});
