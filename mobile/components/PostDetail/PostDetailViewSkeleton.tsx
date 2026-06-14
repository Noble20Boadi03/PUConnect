import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../constants';
import { useThemeColor } from '../../hooks';
import { Shimmer } from '../Shimmer';

export const PostDetailViewSkeleton: React.FC = () => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const footerBottom = insets.bottom;
  const footerHeight = 60;

  return (
    <View style={[styles.root, { backgroundColor: screenBg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: footerHeight + footerBottom + Spacing.lg,
        }}
      >
        <View style={[styles.galleryPlaceholder, { backgroundColor: subtleBg }]} />

        <View style={[styles.contentCard, { backgroundColor: cardBg }]}>
          <View style={styles.metaRow}>
            <Shimmer width={80} height={28} borderRadius={8} />
            <View style={styles.dateRow}>
              <Shimmer width={14} height={14} borderRadius={7} />
              <Shimmer width={100} height={16} borderRadius={4} style={{ marginLeft: 4 }} />
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Shimmer width="80%" height={28} borderRadius={4} />
            <Shimmer width="60%" height={28} borderRadius={4} style={{ marginTop: 4 }} />
          </View>

          <View style={[styles.categorySection, { backgroundColor: subtleBg }]}>
            <View style={styles.categoryHeader}>
              <Shimmer width={20} height={20} borderRadius={10} />
              <Shimmer width={120} height={18} borderRadius={4} style={{ marginLeft: 8 }} />
            </View>
          </View>

          <View style={[styles.amountCard, { backgroundColor: subtleBg }]}>
            <View style={styles.amountIconWrap}>
              <Shimmer width={40} height={40} borderRadius={12} />
            </View>
            <View style={styles.amountTextBlock}>
              <Shimmer width={60} height={14} borderRadius={4} />
              <Shimmer width={100} height={24} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>

          <View style={styles.divider} />

          <Shimmer width="40%" height={20} borderRadius={4} />
          <View style={styles.bodyBlock}>
            <Shimmer width="100%" height={16} borderRadius={4} />
            <Shimmer width="100%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
            <Shimmer width="80%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
          </View>

          <View style={styles.divider} />

          <Shimmer width="40%" height={20} borderRadius={4} />
          <View style={styles.hashtagWrap}>
            <Shimmer width={60} height={28} borderRadius={14} />
            <Shimmer width={80} height={28} borderRadius={14} style={{ marginLeft: 8 }} />
            <Shimmer width={50} height={28} borderRadius={14} style={{ marginLeft: 8 }} />
          </View>

          <View style={styles.divider} />

          <Shimmer width="50%" height={20} borderRadius={4} />
          <View style={[styles.personCard, { backgroundColor: subtleBg }]}>
            <Shimmer width={52} height={52} borderRadius={14} />
            <View style={styles.personInfo}>
              <Shimmer width={120} height={20} borderRadius={4} />
              <Shimmer width={80} height={16} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
            <Shimmer width={20} height={20} borderRadius={10} />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + Spacing.xs, paddingHorizontal: Spacing.lg },
        ]}
      >
        <View style={[styles.iconButton, { backgroundColor: subtleBg }]} />
      </View>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: cardBg,
            paddingBottom: footerBottom,
          },
        ]}
      >
        <Shimmer width="100%" height={48} borderRadius={16} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  galleryPlaceholder: {
    height: 300,
    width: '100%',
  },
  contentCard: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  titleBlock: {
    marginBottom: Spacing.md,
  },
  categorySection: {
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.lg,
  },
  amountIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountTextBlock: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.lg,
    backgroundColor: 'transparent',
  },
  bodyBlock: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  hashtagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  personInfo: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    zIndex: 10,
  },
});
