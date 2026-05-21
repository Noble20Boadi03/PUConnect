import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, CARD_BORDER } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import type { ExploreProvider } from '../../types/explore';

export interface ExploreProviderCardProps {
  provider: ExploreProvider;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  accentColor: string;
  isLast?: boolean;
  onPress?: (provider: ExploreProvider) => void;
}

const ExploreProviderCardComponent: React.FC<ExploreProviderCardProps> = ({
  provider,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  accentColor,
  isLast = false,
  onPress,
}) => {
  const reviewLabel = `${provider.reviewCount} review${provider.reviewCount === 1 ? '' : 's'}`;

  return (
    <GuardedPressable
      style={[
        styles.card,
        { backgroundColor: cardBg },
        !isLast && styles.cardSpacing,
        CARD_BORDER,
      ]}
      onPress={onPress ? () => onPress(provider) : undefined}
      activeOpacity={0.88}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${provider.displayName}, ${provider.averageRating} stars, ${reviewLabel}`}
    >
      <Image
        source={{ uri: provider.avatarUrl }}
        style={[styles.avatar, { borderColor: subtleBg }]}
        contentFit="cover"
        transition={0}
      />

      <View style={styles.content}>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {provider.displayName}
          </Text>
          <Text style={[styles.handle, { color: mutedColor }]} numberOfLines={1}>
            {provider.handle}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={accentColor} />
          <Text style={[styles.ratingValue, { color: textColor }]}>
            {provider.averageRating.toFixed(1)}
          </Text>
          <Text style={[styles.reviewCount, { color: mutedColor }]}>{reviewLabel}</Text>
        </View>

        <Text style={[styles.skillTitle, { color: textColor }]} numberOfLines={2}>
          {provider.skillTitle}
        </Text>

        <View style={styles.tagsWrap}>
          {provider.expertiseTags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: primaryColor + '14' }]}
            >
              <Text style={[styles.tagText, { color: primaryColor }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={mutedColor} style={styles.chevron} />
    </GuardedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.md,
  },
  cardSpacing: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  nameBlock: {
    gap: 2,
  },
  name: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  handle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  skillTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  chevron: {
    marginTop: Spacing.xs,
  },
});

export const ExploreProviderCard = memo(ExploreProviderCardComponent);
export default ExploreProviderCard;
