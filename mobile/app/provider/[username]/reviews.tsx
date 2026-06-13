import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ProviderReviewsView } from '../../../components/ProviderReviews';
import { mapApiProfileToProviderProfile } from '../../../lib';
import {
  selectCanReviewProvider,
  selectReviewableDeal,
  useProviderReviewsStore,
} from '../../../store/providerReviewsStore';
import { useAppRouter } from '../../../hooks';
import { Spacing, Typography } from '../../../constants';
import { profileService, reviewService } from '../../../services';
import type { ProviderProfile, ProviderReview } from '../../../types';

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

function computeSummary(reviews: ProviderReview[]): { averageRating: number; reviewCount: number } {
  if (reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    averageRating: Math.round((total / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

export default function ProviderReviewsScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const [profile, setProfile] = useState<ProviderProfile | undefined>();
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const submittedReviews = useProviderReviewsStore((s) => s.submittedReviews);
  const completedDeals = useProviderReviewsStore((s) => s.completedDeals);

  const fetchData = useCallback(async () => {
    if (typeof username !== 'string') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      // Fetch provider profile
      const profileData = await profileService.getPublicProfile(username);
      const mappedProfile = mapApiProfileToProviderProfile(profileData);
      setProfile(mappedProfile);

      // Fetch reviews
      const reviewsData = await reviewService.getReviewsForUser(username);
      const mappedReviews = reviewsData.map(mapDbReviewToProviderReview);
      
      // Combine with user's own reviews from store
      const ownReviews = submittedReviews
        .filter(r => r.revieweeUsername === username)
        .map(r => ({ ...r, isOwn: true } as ProviderReview));
      
      setReviews([...ownReviews, ...mappedReviews]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [username, submittedReviews]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = useMemo(() => computeSummary(reviews), [reviews]);

  const canLeaveReview = useMemo(
    () =>
      profile
        ? selectCanReviewProvider(completedDeals, submittedReviews, profile.username)
        : false,
    [profile, completedDeals, submittedReviews]
  );

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else if (profile) {
      router.replace(`/provider/${profile.username}` as any);
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router, profile]);

  const handleLeaveReview = useCallback(() => {
    if (!profile) return;
    const deal = selectReviewableDeal(completedDeals, submittedReviews, profile.username);
    if (!deal) return;
    router.push(
      `/provider/${profile.username}/review?postId=${encodeURIComponent(deal.postId)}` as any
    );
  }, [profile, completedDeals, submittedReviews, router]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: screenBg }]} edges={['top']}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <Text style={[styles.notFoundTitle, { color: textColor }]}>
          {error || 'Profile not found'}
        </Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ProviderReviewsView
      revieweeUsername={profile.username}
      displayName={profile.displayName}
      onBack={handleBack}
      onLeaveReview={canLeaveReview ? handleLeaveReview : undefined}
      reviews={reviews}
      summary={summary}
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
