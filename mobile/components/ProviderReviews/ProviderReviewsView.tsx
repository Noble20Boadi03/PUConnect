import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import {
  selectCanReviewProvider,
  selectReviewsForProvider,
  selectSummaryForProvider,
  useProviderReviewsStore,
} from '../../store/providerReviewsStore';
import type { ProviderReview } from '../../types/review';

export interface ProviderReviewsViewProps {
  revieweeUsername: string;
  displayName: string;
  onBack: () => void;
  onLeaveReview?: () => void;
}

function ReviewCard({
  review,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  accentColor,
}: {
  review: ProviderReview;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
}) {
  return (
    <View style={[styles.reviewCard, { backgroundColor: cardBg }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.avatar, { backgroundColor: subtleBg }]}>
          <Text style={[styles.avatarText, { color: textColor }]}>{review.authorInitials}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={[styles.authorName, { color: textColor }]}>
            {review.authorDisplayName}
            {review.isOwn ? (
              <Text style={[styles.youBadge, { color: accentColor }]}> · You</Text>
            ) : null}
          </Text>
          <Text style={[styles.serviceTitle, { color: mutedColor }]} numberOfLines={1}>
            {review.serviceTitle}
          </Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={accentColor} />
          <Text style={[styles.ratingText, { color: textColor }]}>{review.rating}</Text>
        </View>
      </View>
      <Text style={[styles.comment, { color: textColor }]}>{review.comment}</Text>
      <Text style={[styles.date, { color: mutedColor }]}>{review.createdAt}</Text>
    </View>
  );
}

export const ProviderReviewsView: React.FC<ProviderReviewsViewProps> = ({
  revieweeUsername,
  displayName,
  onBack,
  onLeaveReview,
}) => {
  const Colors = useThemeColor();
  const isDark = useColorScheme() === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const accentColor = '#F59E0B';

  const submittedReviews = useProviderReviewsStore((s) => s.submittedReviews);
  const completedDeals = useProviderReviewsStore((s) => s.completedDeals);

  const reviews = useMemo(
    () => selectReviewsForProvider(submittedReviews, revieweeUsername),
    [submittedReviews, revieweeUsername]
  );
  const summary = useMemo(
    () => selectSummaryForProvider(submittedReviews, revieweeUsername),
    [submittedReviews, revieweeUsername]
  );
  const showLeaveReview = useMemo(
    () => selectCanReviewProvider(completedDeals, submittedReviews, revieweeUsername) && onLeaveReview,
    [completedDeals, submittedReviews, revieweeUsername, onLeaveReview]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]} numberOfLines={1}>
          Reviews
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.summaryName, { color: Colors.text }]}>{displayName}</Text>
          <View style={styles.summaryRatingRow}>
            <Ionicons name="star" size={28} color={accentColor} />
            <Text style={[styles.summaryRating, { color: Colors.text }]}>
              {summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : '—'}
            </Text>
            <Text style={[styles.summaryCount, { color: Colors.icon }]}>
              {summary.reviewCount} review{summary.reviewCount === 1 ? '' : 's'}
            </Text>
          </View>
          {showLeaveReview ? (
            <TouchableOpacity
              style={[styles.leaveReviewBtn, { backgroundColor: Colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onLeaveReview?.();
              }}
              activeOpacity={0.9}
            >
              <Ionicons name="create-outline" size={18} color={isDark ? '#09090B' : '#FFFFFF'} />
              <Text style={[styles.leaveReviewText, { color: isDark ? '#09090B' : '#FFFFFF' }]}>
                Leave a Review
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {reviews.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={Colors.icon} />
            <Text style={[styles.emptyTitle, { color: Colors.text }]}>No reviews yet</Text>
            <Text style={[styles.emptyBody, { color: Colors.icon }]}>
              Reviews appear here after clients complete an official undertaking and choose to
              share feedback.
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              cardBg={cardBg}
              subtleBg={subtleBg}
              textColor={Colors.text}
              mutedColor={Colors.icon}
              accentColor={accentColor}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  summaryCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryName: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  summaryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryRating: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryCount: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  leaveReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
  },
  leaveReviewText: {
    fontSize: Typography.size.sm,
    fontWeight: '800',
  },
  reviewCard: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
  },
  reviewMeta: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  youBadge: {
    fontWeight: '800',
  },
  serviceTitle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: Typography.size.sm,
    fontWeight: '800',
  },
  comment: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 21,
  },
  date: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProviderReviewsView;
