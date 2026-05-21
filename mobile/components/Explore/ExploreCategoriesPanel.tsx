import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Spacing, Typography } from '../../constants';
import { ExploreCategoryCard } from './ExploreCategoryCard';
import type { ExploreCategory } from '../../types/explore';

export interface ExploreCategoriesPanelProps {
  categories: ExploreCategory[];
  cardBg: string;
  textColor: string;
  mutedColor: string;
  onCategoryPress?: (category: ExploreCategory) => void;
}

export const ExploreCategoriesPanel: React.FC<ExploreCategoriesPanelProps> = ({
  categories,
  cardBg,
  textColor,
  mutedColor,
  onCategoryPress,
}) => (
  <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    <Text style={[styles.sectionHint, { color: mutedColor }]}>
      Browse campus services by area — tap a category to drill into subcategories and filters
      (coming soon).
    </Text>
    {categories.map((category) => (
      <ExploreCategoryCard
        key={category.id}
        category={category}
        cardBg={cardBg}
        textColor={textColor}
        mutedColor={mutedColor}
        onPress={onCategoryPress}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionHint: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
});

export default ExploreCategoriesPanel;
