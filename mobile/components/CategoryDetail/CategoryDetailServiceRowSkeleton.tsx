import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shimmer } from '../Shimmer';
import { Spacing } from '../../constants';

export const CategoryDetailServiceRowSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <View style={styles.iconAccent}>
          <Shimmer width={36} height={36} borderRadius={11} />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Shimmer width="70%" height={22} borderRadius={4} />
        <Shimmer width="100%" height={19} borderRadius={4} style={{ marginTop: 4 }} />
      </View>

      <Shimmer width={18} height={18} borderRadius={4} />
    </View>
  );
};

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
});

export default CategoryDetailServiceRowSkeleton;
