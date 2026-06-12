import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { Spacing } from '../../constants';
import { useThemeColor } from '../../hooks';
import { Shimmer } from '../Shimmer';
import { ExploreProviderCardSkeleton } from './ExploreProviderCardSkeleton';

export interface ExploreServiceProvidersPanelSkeletonProps {}

export const ExploreServiceProvidersPanelSkeleton: React.FC<ExploreServiceProvidersPanelSkeletonProps> = () => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  return (
    <View style={styles.root}>
      {/* Tag pills skeleton */}
      <View style={styles.tagsRow}>
        <Shimmer width={60} height={32} borderRadius={16} />
        <View style={{ width: Spacing.sm }} />
        <Shimmer width={80} height={32} borderRadius={16} />
        <View style={{ width: Spacing.sm }} />
        <Shimmer width={70} height={32} borderRadius={16} />
      </View>

      {/* Provider cards skeleton */}
      <View style={styles.scrollContent}>
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ExploreProviderCardSkeleton key={index} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  list: {
    gap: 6,
  },
});

export default ExploreServiceProvidersPanelSkeleton;
