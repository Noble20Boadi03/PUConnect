import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shimmer } from '../Shimmer';
import { Spacing } from '../../constants';

export const ExploreProviderCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <Shimmer width={48} height={48} borderRadius={24} />
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Shimmer width="70%" height={18} borderRadius={4} />
          <Shimmer width={50} height={18} borderRadius={4} />
        </View>
        <Shimmer width="40%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
        <Shimmer width="60%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
      <Shimmer width={18} height={18} borderRadius={4} />
    </View>
  );
};

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
  content: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});

export default ExploreProviderCardSkeleton;
