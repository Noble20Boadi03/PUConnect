import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing, CARD_SHADOW, CARD_BORDER } from '../../constants';
import { Shimmer } from '../Shimmer';

interface FeaturedPostCardSkeletonProps {
  layout?: 'stack' | 'carousel';
}

export const FeaturedPostCardSkeleton: React.FC<FeaturedPostCardSkeletonProps> = ({
  layout = 'stack',
}) => {
  const isCarousel = layout === 'carousel';
  const thumbHeight = isCarousel ? 112 : 128;

  return (
    <View
      style={[
        styles.cardOuter,
        isCarousel ? styles.cardOuterCarousel : undefined,
      ]}
    >
      <View style={styles.card}>
        <View style={[styles.thumbnailWrap, { height: thumbHeight }]}>
          <Shimmer width="100%" height="100%" />
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Shimmer width={60} height={24} borderRadius={8} />
            <Shimmer width={80} height={14} borderRadius={4} />
          </View>

          <View style={styles.titleBlock}>
            <Shimmer width="100%" height={22} borderRadius={4} />
            <Shimmer width="80%" height={20} borderRadius={4} style={{ marginTop: 4 }} />
            <Shimmer width="60%" height={20} borderRadius={4} style={{ marginTop: 4 }} />
          </View>

          <View style={styles.footer}>
            <View style={styles.authorRow}>
              <Shimmer width={32} height={32} borderRadius={16} />
              <Shimmer width={100} height={16} borderRadius={4} style={{ marginLeft: 8 }} />
            </View>
            <View style={styles.priceRow}>
              <Shimmer width={60} height={18} borderRadius={4} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 16,
    marginBottom: Spacing.md,
    ...CARD_SHADOW,
  },
  cardOuterCarousel: {
    width: '82%',
    marginBottom: 0,
    ...CARD_BORDER,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnailWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleBlock: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    paddingTop: Spacing.sm + 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
