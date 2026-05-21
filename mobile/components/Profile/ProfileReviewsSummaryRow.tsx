import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GuardedPressable } from '../GuardedPressable';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';

export interface ProfileReviewsSummaryRowProps {
  averageRating: number;
  reviewCount: number;
  textColor: string;
  mutedColor: string;
  accentColor?: string;
  onPress: () => void;
}

export const ProfileReviewsSummaryRow: React.FC<ProfileReviewsSummaryRowProps> = ({
  averageRating,
  reviewCount,
  textColor,
  mutedColor,
  accentColor = '#F59E0B',
  onPress,
}) => {
  const ratingLabel = reviewCount > 0 ? averageRating.toFixed(1) : '—';
  const subtitle =
    reviewCount > 0
      ? `${reviewCount} review${reviewCount === 1 ? '' : 's'} · tap to see reviews`
      : 'No reviews yet · tap to see reviews';

  return (
    <GuardedPressable
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${ratingLabel} stars, ${reviewCount} reviews. Open reviews.`}
    >
      <View style={[styles.iconCircle, { backgroundColor: accentColor + '18' }]}>
        <Ionicons name="star" size={18} color={accentColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: mutedColor }]}>Reviews</Text>
        <View style={styles.ratingRow}>
          <Text style={[styles.ratingValue, { color: textColor }]}>{ratingLabel}</Text>
          {reviewCount > 0 ? (
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(averageRating) ? 'star' : 'star-outline'}
                  size={12}
                  color={accentColor}
                />
              ))}
            </View>
          ) : null}
        </View>
        <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={mutedColor} />
    </GuardedPressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md - 2,
    paddingVertical: Spacing.sm + 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingValue: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
});

export default ProfileReviewsSummaryRow;
