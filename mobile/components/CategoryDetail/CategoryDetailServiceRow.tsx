import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, CARD_BORDER } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import type { ExploreCategoryService } from '../../types/explore';

export interface CategoryDetailServiceRowProps {
  service: ExploreCategoryService;
  accentColor: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  onPress?: (service: ExploreCategoryService) => void;
}

const CategoryDetailServiceRowComponent: React.FC<CategoryDetailServiceRowProps> = ({
  service,
  accentColor,
  cardBg,
  borderColor,
  textColor,
  mutedColor,
  onPress,
}) => (
  <GuardedPressable
    style={[styles.card, { backgroundColor: cardBg, borderColor }, CARD_BORDER]}
    onPress={onPress ? () => onPress(service) : undefined}
    activeOpacity={0.72}
    disabled={!onPress}
    accessibilityRole="button"
    accessibilityLabel={service.title}
  >

    <View style={styles.textBlock}>
      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {service.title}
      </Text>
      <Text style={[styles.description, { color: mutedColor }]} numberOfLines={2}>
        {service.description}
      </Text>
    </View>

    <Ionicons name="chevron-forward" size={18} color={mutedColor} />
  </GuardedPressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 76,
    borderRadius: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconAccent: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  description: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 19,
  },
});

export const CategoryDetailServiceRow = memo(CategoryDetailServiceRowComponent);
export default CategoryDetailServiceRow;
