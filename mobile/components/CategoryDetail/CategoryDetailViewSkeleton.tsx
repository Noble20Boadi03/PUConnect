import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '../../constants';
import { getSafeAreaBottom, getScreenTopPadding } from '../../lib/safeAreaInsets';
import { Shimmer } from '../Shimmer';
import { CategoryDetailServiceRowSkeleton } from './CategoryDetailServiceRowSkeleton';

export const CategoryDetailViewSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const insets = useSafeAreaInsets();
  const topPadding = getScreenTopPadding(insets.top);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: screenBg,
          paddingTop: topPadding,
          paddingBottom: getSafeAreaBottom(insets.bottom),
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.backButton, { backgroundColor: subtleBg }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: cardBg }]}>
          <View style={styles.heroIconWrap}>
            <Shimmer width={64} height={64} borderRadius={18} />
          </View>
          <View style={styles.heroText}>
            <Shimmer width="70%" height={24} borderRadius={4} />
            <Shimmer width="50%" height={19} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
          <Shimmer width={56} height={56} borderRadius={12} />
        </View>

        <Shimmer width="100%" height={21} borderRadius={4} style={{ marginBottom: Spacing.xl }} />

        <Shimmer width="40%" height={22} borderRadius={4} style={{ marginBottom: Spacing.md }} />

        <View style={styles.serviceList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <CategoryDetailServiceRowSkeleton key={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  serviceList: {
    gap: Spacing.sm + 2,
  },
});

export default CategoryDetailViewSkeleton;
