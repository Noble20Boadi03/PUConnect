import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ProviderProfileView, ProviderProfileViewSkeleton } from '../../components/ProviderProfile';
import { buildChatHref } from '../../lib';
import { useAppRouter } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { useProviderProfileStore } from '../../store';
import { profileService, reviewService } from '../../services';
import type { ProviderReview } from '../../types/review';

export default function ProviderProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const { data: profile, isLoading, isRefreshing, fetchProviderProfile, clearCache } = useProviderProfileStore();
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Function to convert DbReview (API response) to ProviderReview type
  function mapDbReviewToProviderReview(review: any): ProviderReview {
    return {
      id: review.id,
      revieweeUsername: review.reviewee.username,
      authorDisplayName: review.reviewer.name,
      authorInitials: review.reviewer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      rating: review.rating,
      comment: review.comment,
      serviceTitle: review.serviceTitle || '',
      createdAt: new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }

  const fetchReviews = useCallback(async () => {
    if (typeof username !== 'string') return;

    setReviewsLoading(true);
    try {
      const reviewsData = await reviewService.getReviewsForUser(username);
      const mappedReviews = reviewsData.map(mapDbReviewToProviderReview);
      setReviews(mappedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [username]);

  const onRefresh = useCallback(() => {
    if (typeof username === 'string') {
      clearCache();
      fetchProviderProfile(username, true);
      fetchReviews();
    }
  }, [username, clearCache, fetchProviderProfile, fetchReviews]);

  useEffect(() => {
    if (typeof username === 'string') {
      fetchProviderProfile(username);
      fetchReviews();
    }
  }, [username, fetchProviderProfile, fetchReviews]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router]);

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/post/${postId}?fromProvider=1` as any);
    },
    [router]
  );

  const handleSendMessage = useCallback(() => {
    if (!profile) return;
    router.push(buildChatHref(profile.handle) as any);
  }, [profile, router]);

  const handleOpenReviews = useCallback(() => {
    if (!profile) return;
    router.push(`/provider/${profile.username}/reviews` as any);
  }, [profile, router]);

  const handleLeaveReview = useCallback(() => {
    if (!profile) return;
    router.push(`/provider/${profile.username}/review` as any);
  }, [profile, router]);

  if (isLoading) {
    return <ProviderProfileViewSkeleton />;
  }

  if (!profile) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <Text style={[styles.notFoundTitle, { color: textColor }]}>Profile not found</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ProviderProfileView
      profile={profile}
      reviews={reviews}
      onBack={handleBack}
      onPostPress={handlePostPress}
      onSendMessage={handleSendMessage}
      onOpenReviews={handleOpenReviews}
      onLeaveReview={handleLeaveReview}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notFoundTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notFoundBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
});
