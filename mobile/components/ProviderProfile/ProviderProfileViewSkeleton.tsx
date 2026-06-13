import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '../../constants';
import { useThemeColor } from '../../hooks';
import { Shimmer } from '../Shimmer';
import { ExploreProviderCardSkeleton } from '../Explore';

export const ProviderProfileViewSkeleton: React.FC = () => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.backButton, { backgroundColor: subtleBg }]} />
        <Shimmer width="60%" height={24} borderRadius={4} />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileSection, { backgroundColor: cardBg }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Shimmer width={96} height={96} borderRadius={48} />
            </View>
          </View>

          <Shimmer width={160} height={28} borderRadius={4} />
          <Shimmer width={100} height={18} borderRadius={4} style={{ marginTop: 4 }} />

          <View style={styles.messageButton}>
            <Shimmer width="60%" height={40} borderRadius={14} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Shimmer width={100} height={20} borderRadius={4} />
        </View>
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <View style={styles.infoRow}>
            <Shimmer width={40} height={40} borderRadius={12} />
            <View style={[styles.infoTextBlock, { marginLeft: 12 }]}>
              <Shimmer width={80} height={14} borderRadius={4} />
              <Shimmer width={120} height={18} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Shimmer width={40} height={40} borderRadius={12} />
            <View style={[styles.infoTextBlock, { marginLeft: 12 }]}>
              <Shimmer width={80} height={14} borderRadius={4} />
              <Shimmer width="100%" height={16} borderRadius={4} style={{ marginTop: 4 }} />
              <Shimmer width="80%" height={16} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.skillsBlock}>
            <Shimmer width={40} height={40} borderRadius={12} />
            <View style={[styles.skillsContent, { marginLeft: 12 }]}>
              <Shimmer width={80} height={14} borderRadius={4} />
              <View style={[styles.skillsWrap, { marginTop: 8 }]}>
                <Shimmer width={60} height={28} borderRadius={8} />
                <Shimmer width={80} height={28} borderRadius={8} style={{ marginLeft: 8 }} />
                <Shimmer width={50} height={28} borderRadius={8} style={{ marginLeft: 8 }} />
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.reviewsRow}>
            <Shimmer width={40} height={40} borderRadius={12} />
            <View style={[styles.reviewsText, { marginLeft: 12, flex: 1 }]}>
              <Shimmer width={100} height={18} borderRadius={4} />
              <Shimmer width={120} height={14} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
            <Shimmer width={20} height={20} borderRadius={10} />
          </View>
        </View>

        <View style={styles.postsSection}>
          <View style={styles.postsHeader}>
            <Shimmer width={60} height={20} borderRadius={4} />
          </View>
          <View style={styles.tabsPlaceholder}>
            <Shimmer width="100%" height={40} borderRadius={12} />
          </View>
          <View style={styles.postsList}>
            <ExploreProviderCardSkeleton />
            <ExploreProviderCardSkeleton />
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  profileSection: {
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
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
  infoTextBlock: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 54,
    marginVertical: Spacing.md,
    backgroundColor: 'transparent',
  },
  skillsBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm + 2,
  },
  skillsContent: {
    flex: 1,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  reviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsText: {
    flex: 1,
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
    gap: Spacing.md,
  },
});
