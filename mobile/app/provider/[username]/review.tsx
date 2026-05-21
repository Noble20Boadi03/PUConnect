import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SubmitProviderReviewView } from '../../../components/ProviderReviews';
import { getProviderProfileByUsername } from '../../../lib';
import {
  selectCanReviewProvider,
  selectReviewableDeal,
  useProviderReviewsStore,
} from '../../../store/providerReviewsStore';
import { Spacing, Typography } from '../../../constants';

export default function SubmitProviderReviewScreen() {
  const { username, postId } = useLocalSearchParams<{ username: string; postId?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const profile =
    typeof username === 'string' ? getProviderProfileByUsername(username) : undefined;

  const completedDeals = useProviderReviewsStore((s) => s.completedDeals);
  const submittedReviews = useProviderReviewsStore((s) => s.submittedReviews);

  const deal = useMemo(() => {
    if (!profile) return undefined;
    const resolvedPostId = typeof postId === 'string' ? postId : undefined;
    if (resolvedPostId) {
      return completedDeals.find(
        (d) => d.revieweeUsername === profile.username && d.postId === resolvedPostId
      );
    }
    return selectReviewableDeal(completedDeals, submittedReviews, profile.username);
  }, [profile, postId, completedDeals, submittedReviews]);

  const eligibleToReview = useMemo(
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
      router.replace(`/provider/${profile.username}/reviews` as any);
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router, profile]);

  const handleSubmitted = useCallback(() => {
    if (!profile) return;
    router.replace(`/provider/${profile.username}/reviews` as any);
  }, [profile, router]);

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

  if (!deal || !eligibleToReview) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <Ionicons name="lock-closed-outline" size={32} color={textColor} />
        <Text style={[styles.notFoundTitle, { color: textColor }]}>Review not available</Text>
        <Text style={[styles.notFoundBody, { color: textColor }]}>
          Only clients who completed an official undertaking with {profile.displayName} can leave a
          review.
        </Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SubmitProviderReviewView
      revieweeUsername={profile.username}
      displayName={profile.displayName}
      deal={deal}
      onBack={handleBack}
      onSubmitted={handleSubmitted}
    />
  );
}

const styles = StyleSheet.create({
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
    textAlign: 'center',
  },
  notFoundBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.85,
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  notFoundBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
});
