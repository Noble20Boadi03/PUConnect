import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ProviderReviewsView } from '../../../components/ProviderReviews';
import { getProviderProfileByUsername } from '../../../lib';
import {
  selectCanReviewProvider,
  selectReviewableDeal,
  useProviderReviewsStore,
} from '../../../store/providerReviewsStore';
import { useAppRouter } from '../../../hooks';
import { Spacing, Typography } from '../../../constants';

export default function ProviderReviewsScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const profile =
    typeof username === 'string' ? getProviderProfileByUsername(username) : undefined;

  const submittedReviews = useProviderReviewsStore((s) => s.submittedReviews);
  const completedDeals = useProviderReviewsStore((s) => s.completedDeals);

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
    <ProviderReviewsView
      revieweeUsername={profile.username}
      displayName={profile.displayName}
      onBack={handleBack}
      onLeaveReview={canLeaveReview ? handleLeaveReview : undefined}
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
