import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Spacing, Typography } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import type { ExploreCategory } from '../../types/explore';

export interface ExploreCategoryCardProps {
  category: ExploreCategory;
  onPress?: (category: ExploreCategory) => void;
}

const THUMB_SIZE = 62;

const ExploreCategoryCardComponent: React.FC<ExploreCategoryCardProps> = ({
  category,
  onPress,
}) => (
  <GuardedPressable
    style={[styles.card, { backgroundColor: category.accentColor }]}
    onPress={onPress ? () => onPress(category) : undefined}
    activeOpacity={0.92}
    disabled={!onPress}
    accessibilityRole="button"
    accessibilityLabel={category.title}
  >
    <Text style={styles.title} numberOfLines={2}>
      {category.title}
    </Text>

    <View style={styles.thumbShadow}>
      <Image
        source={{ uri: category.imageUrl }}
        style={styles.thumb}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={`explore-cat-${category.id}`}
        transition={0}
      />
    </View>
  </GuardedPressable>
);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 92,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: Typography.size.md,
    fontWeight: '700',
    letterSpacing: -0.25,
    lineHeight: 20,
    paddingRight: Spacing.sm,
  },
  thumbShadow: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginRight: Spacing.xs,
    borderRadius: 12,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 6,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ rotate: '10deg' }],
  },
});

export const ExploreCategoryCard = memo(ExploreCategoryCardComponent);
export default ExploreCategoryCard;
