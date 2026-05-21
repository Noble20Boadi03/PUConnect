import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Typography, CARD_SHADOW } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import type { ExploreCategory } from '../../types/explore';

export interface ExploreCategoryCardProps {
  category: ExploreCategory;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  onPress?: (category: ExploreCategory) => void;
}

const ExploreCategoryCardComponent: React.FC<ExploreCategoryCardProps> = ({
  category,
  cardBg,
  textColor,
  mutedColor,
  onPress,
}) => (
  <View style={[styles.cardOuter, { backgroundColor: cardBg }]}>
    <GuardedPressable
      style={styles.card}
      onPress={onPress ? () => onPress(category) : undefined}
      activeOpacity={0.9}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.title}. ${category.description}`}
    >
      <View style={styles.mediaWrap}>
        <Image
          source={{ uri: category.imageUrl }}
          style={styles.media}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.mediaGradient}
        />
        <View style={[styles.accentBadge, { backgroundColor: category.accentColor }]}>
          <Ionicons name="grid-outline" size={14} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {category.title}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={mutedColor} />
        </View>
        <Text style={[styles.description, { color: mutedColor }]} numberOfLines={3}>
          {category.description}
        </Text>
      </View>
    </GuardedPressable>
  </View>
);

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 16,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaWrap: {
    height: 148,
    width: '100%',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  accentBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  description: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export const ExploreCategoryCard = memo(ExploreCategoryCardComponent);
export default ExploreCategoryCard;
