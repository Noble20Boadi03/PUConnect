import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '../constants';
import { useThemeColor } from '../hooks';
import { Shimmer } from './Shimmer';
import { FeaturedPostCardSkeleton } from './FeaturedPostCard';

export const MarketViewSkeleton: React.FC = () => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: cardBg }]}>
        <View style={styles.headerRow}>
          <Shimmer width={120} height={28} borderRadius={4} />
          <View style={styles.headerIcons}>
            <Shimmer width={32} height={32} borderRadius={16} />
            <Shimmer width={40} height={40} borderRadius={20} style={{ marginLeft: 8 }} />
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: subtleBg }]}>
          <Shimmer width={18} height={18} borderRadius={9} />
          <Shimmer width="80%" height={18} borderRadius={4} style={{ marginLeft: 12 }} />
        </View>

        <View style={styles.filterRow}>
          <Shimmer width={60} height={28} borderRadius={20} />
          <Shimmer width={70} height={28} borderRadius={20} style={{ marginLeft: 8 }} />
          <Shimmer width={80} height={28} borderRadius={20} style={{ marginLeft: 8 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Popular Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shimmer width={140} height={20} borderRadius={4} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
          >
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ marginLeft: i > 1 ? 12 : 0 }}>
                <Shimmer width={140} height={160} borderRadius={16} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recently Viewed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shimmer width={140} height={20} borderRadius={4} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
          >
            {[1, 2].map((i) => (
              <View key={i} style={{ marginLeft: i > 1 ? Spacing.md : 0 }}>
                <FeaturedPostCardSkeleton layout="carousel" />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shimmer width={140} height={20} borderRadius={4} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
          >
            {[1, 2].map((i) => (
              <View key={i} style={{ marginLeft: i > 1 ? Spacing.md : 0 }}>
                <FeaturedPostCardSkeleton layout="carousel" />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shimmer width={140} height={20} borderRadius={4} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
          >
            {[1, 2].map((i) => (
              <View key={i} style={{ marginLeft: i > 1 ? Spacing.md : 0 }}>
                <FeaturedPostCardSkeleton layout="carousel" />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.sm + 4,
    height: 44,
    marginBottom: Spacing.sm + 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm + 4,
  },
  hListContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
});
