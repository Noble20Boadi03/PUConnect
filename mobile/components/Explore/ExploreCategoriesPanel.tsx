import React from 'react';
import { StyleSheet, View, RefreshControlProps } from 'react-native';
import { Spacing } from '../../constants';
import { ExploreCategoryCard } from './ExploreCategoryCard';
import type { ExploreCategory } from '../../types/explore';

const HORIZONTAL_PAD = Spacing.lg;
const LIST_GAP = Spacing.sm + 4;

export interface ExploreCategoriesPanelProps {
  categories: ExploreCategory[];
  onCategoryPress?: (category: ExploreCategory) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ExploreCategoriesPanel: React.FC<ExploreCategoriesPanelProps> = ({
  categories,
  onCategoryPress,
  refreshControl,
}) => (
  <View style={styles.scrollContent}>
    <View style={styles.list}>
      {categories.map((category) => (
        <ExploreCategoryCard
          key={category.id}
          category={category}
          onPress={onCategoryPress}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PAD,
    paddingBottom: 120,
  },
  list: {
    gap: LIST_GAP,
  },
});

export default ExploreCategoriesPanel;
