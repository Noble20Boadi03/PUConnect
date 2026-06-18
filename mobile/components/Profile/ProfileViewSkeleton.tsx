import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '../../constants';
import { useThemeColor, useTabBarHeight } from '../../hooks';
import { Shimmer } from '../Shimmer';
import { FeaturedPostCardSkeleton } from '../FeaturedPostCard';

export const ProfileViewSkeleton: React.FC = () => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tabBarHeight = useTabBarHeight();
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#09090B' : '#F4F4F5' }]} edges={['top']}>
      <View style={styles.header}>
        <Shimmer width={100} height={28} borderRadius={4} />
        <View style={styles.headerActions}>
          <Shimmer width={40} height={40} borderRadius={20} />
          <Shimmer width={40} height={40} borderRadius={20} style={{ marginLeft: 8 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: cardBg }]}>
          <View style={styles.avatarContainer}>
            <Shimmer width={96} height={96} borderRadius={48} />
          </View>
          <Shimmer width={160} height={28} borderRadius={4} />
          <Shimmer width={100} height={18} borderRadius={4} style={{ marginTop: 4 }} />
          <View style={styles.heroButtons}>
            <Shimmer width={140} height={40} borderRadius={12} />
            <Shimmer width={100} height={40} borderRadius={12} style={{ marginLeft: 12 }} />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.sectionHeader}>
          <Shimmer width={100} height={20} borderRadius={4} />
        </View>
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <View style={styles.infoRow}>
            <Shimmer width={40} height={40} borderRadius={12} />
            <View style={[styles.infoText, { marginLeft: 12 }]}>
              <Shimmer width={80} height={14} borderRadius={4} />
              <Shimmer width={120} height={18} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <View style={styles.infoRow}>
            <Shimmer width={40} height={40} borderRadius={12} />
            <View style={[styles.infoText, { marginLeft: 12 }]}>
              <Shimmer width={80} height={14} borderRadius={4} />
              <Shimmer width={160} height={18} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <View style={styles.infoRow}>
            <Shimmer width={40} height={40} borderRadius={12} />
            <View style={[styles.infoText, { marginLeft: 12 }]}>
              <Shimmer width={80} height={14} borderRadius={4} />
              <Shimmer width={140} height={18} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.postsHeader}>
            <Shimmer width={60} height={20} borderRadius={4} />
          </View>
          <View style={styles.tabsPlaceholder}>
            <Shimmer width="100%" height={40} borderRadius={12} />
          </View>
          <View style={styles.postsList}>
            <FeaturedPostCardSkeleton />
            <FeaturedPostCardSkeleton />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  heroSection: {
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  heroButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    marginTop: Spacing.lg + 4,
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  infoCard: {
    borderRadius: 16,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 54,
    marginVertical: Spacing.md,
  },
  postsSection: {
    marginTop: Spacing.lg + 4,
  },
  postsHeader: {
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  tabsPlaceholder: {
    marginTop: Spacing.md,
  },
  postsList: {
    marginTop: Spacing.md,
  },
});
