import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Spacing } from '../../constants';
import { ExploreCategoryCard } from './ExploreCategoryCard';
import type { ExploreCategory } from '../../types/explore';

const HORIZONTAL_PAD = Spacing.lg;
const LIST_GAP = Spacing.sm + 4;

export interface ExploreCategoriesPanelProps {
  categories: ExploreCategory[];
  onCategoryPress?: (category: ExploreCategory) => void;
}

export const ExploreCategoriesPanel: React.FC<ExploreCategoriesPanelProps> = ({
  categories,
  onCategoryPress,
}) => (
  <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.list}>
      {categories.map((category) => (
        <ExploreCategoryCard
          key={category.id}
          category={category}
          onPress={onCategoryPress}
        />
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PAD,
    paddingBottom: 120,
  },
  list: {
    gap: LIST_GAP,
  },
});

export default ExploreCategoriesPanel;
