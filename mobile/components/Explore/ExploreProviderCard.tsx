import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, CARD_BORDER } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import type { ExploreProvider } from '../../types/explore';

/** Default gold star for ratings (not category-colored). */
export const EXPLORE_RATING_STAR_COLOR = '#F59E0B';

export interface ExploreProviderCardProps {
  provider: ExploreProvider;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  onPress?: (provider: ExploreProvider) => void;
}

const ExploreProviderCardComponent: React.FC<ExploreProviderCardProps> = ({
  provider,
  cardBg,
  borderColor,
  textColor,
  mutedColor,
  onPress,
}) => (
  <GuardedPressable
    style={[
      styles.card,
      { backgroundColor: cardBg, borderColor },
      CARD_BORDER,
    ]}
    onPress={onPress ? () => onPress(provider) : undefined}
    activeOpacity={0.72}
    disabled={!onPress}
    accessibilityRole="button"
    accessibilityLabel={`${provider.displayName}, ${provider.averageRating} stars`}
  >
    <Image
      source={{ uri: provider.avatarUrl }}
      style={styles.avatar}
      contentFit="cover"
      transition={0}
    />

    <View style={styles.content}>
      <View style={styles.nameRow}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {provider.displayName}
        </Text>
        <View style={styles.ratingWrap}>
          <Ionicons name="star" size={14} color={EXPLORE_RATING_STAR_COLOR} />
          <Text style={[styles.rating, { color: textColor }]}>
            {provider.averageRating.toFixed(1)}
          </Text>
        </View>
      </View>

      <Text style={[styles.handle, { color: mutedColor }]} numberOfLines={1}>
        {provider.handle}
      </Text>

      <Text style={[styles.skill, { color: mutedColor }]} numberOfLines={1}>
        {provider.skillTitle}
      </Text>
    </View>

    <Ionicons name="chevron-forward" size={18} color={mutedColor} />
  </GuardedPressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    minHeight: 76,
    borderRadius: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: Typography.size.md,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  handle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  skill: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
});

export const ExploreProviderCard = memo(ExploreProviderCardComponent);
export default ExploreProviderCard;
