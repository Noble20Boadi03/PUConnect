import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, CARD_BORDER } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import { getServiceOptionsByIds } from '../../lib/editInfoForm';
import type { ExploreProvider } from '../../types/explore';

/** Default gold star for ratings (not category-colored). */
export const EXPLORE_RATING_STAR_COLOR = '#F59E0B';

export interface ExploreProviderCardProps {
  provider: ExploreProvider;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  subtleBg: string;
  onPress?: (provider: ExploreProvider) => void;
}

const ExploreProviderCardComponent: React.FC<ExploreProviderCardProps> = ({
  provider,
  cardBg,
  borderColor,
  textColor,
  mutedColor,
  primaryColor,
  subtleBg,
  onPress,
}) => {
  const initials = useMemo(
    () =>
      provider.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    [provider.displayName]
  );

  const skills = useMemo(
    () => getServiceOptionsByIds(provider.serviceIds).map((s) => s.title),
    [provider.serviceIds]
  );

  return (
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
      <View style={[styles.avatarContainer, { backgroundColor: primaryColor + '18' }]}>
        {provider.avatarUrl ? (
          <Image
            source={{ uri: provider.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={0}
          />
        ) : (
          <Text style={[styles.avatarInitials, { color: primaryColor }]}>
            {initials}
          </Text>
        )}
      </View>

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

        <Text style={[styles.handle, { color: primaryColor }]} numberOfLines={1}>
          @{provider.handle}
        </Text>

        {skills.length > 0 ? (
          <View style={styles.skillsWrap}>
            {skills.map((skill, index) => (
              <View
                key={`${provider.username}-${skill}-${index}`}
                style={[styles.skillPill, { backgroundColor: subtleBg }]}
              >
                <Text style={[styles.skillText, { color: textColor }]} numberOfLines={1}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={mutedColor} />
    </GuardedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    borderRadius: 14,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
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
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4,
  },
  skillPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
});

export const ExploreProviderCard = memo(ExploreProviderCardComponent);
export default ExploreProviderCard;
