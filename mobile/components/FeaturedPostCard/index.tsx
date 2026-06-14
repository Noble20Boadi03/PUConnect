import React, { memo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { GuardedPressable } from '../GuardedPressable';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, CARD_SHADOW, CARD_BORDER } from '../../constants';
import { formatPostPrice } from '../../lib';
import type { FeaturedPost } from '../../types';
import { FeaturedPostCardSkeleton } from './FeaturedPostCardSkeleton';

export type FeaturedPostCardLayout = 'stack' | 'carousel';

export interface FeaturedPostCardProps {
  item: FeaturedPost;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  borderColor?: string;
  layout?: FeaturedPostCardLayout;
  /** When false, hides the author avatar and name in the card footer (owner profile lists). */
  showAuthor?: boolean;
  onPress?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
export const FEATURED_POST_CARD_CAROUSEL_WIDTH = SCREEN_WIDTH * 0.82;

const THUMB_HEIGHT_CAROUSEL = 112;
const THUMB_HEIGHT_STACK = 128;

const FeaturedPostCardComponent: React.FC<FeaturedPostCardProps> = ({
  item,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  borderColor = 'rgba(0, 0, 0, 0.08)',
  layout = 'stack',
  showAuthor = true,
  onPress,
}) => {
  const isCarousel = layout === 'carousel';
  const isService = item.tag === 'Service';
  const tagBg = isService ? `${primaryColor}18` : '#F59E0B18';
  const tagColor = isService ? primaryColor : '#F59E0B';
  const timeLabel = item.viewedAt ? `Viewed ${item.viewedAt}` : item.postedAt;
  const priceLabel = formatPostPrice(item.price);
  const thumbHeight = isCarousel ? THUMB_HEIGHT_CAROUSEL : THUMB_HEIGHT_STACK;

  const renderThumbnail = () => {
    if (!isService) return null;
    
    // Check if item has images (new ServicePost) or just thumbnail (backward compatible)
    const images = ('images' in item && item.images) ? item.images : [item.thumbnail];
    const imageCount = images.length;

    if (imageCount === 1) {
      return (
        <View style={[styles.thumbnailWrap, { height: thumbHeight, backgroundColor: subtleBg }]}>
          <Image
            source={{ uri: images[0] }}
            style={styles.thumbnail}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`market-post-${item.id}-0`}
            transition={0}
          />
        </View>
      );
    }

    if (imageCount === 2) {
      return (
        <View style={[styles.thumbnailWrap, { height: thumbHeight, backgroundColor: subtleBg }]}>
          <View style={styles.twoColumnGrid}>
            <Image
              source={{ uri: images[0] }}
              style={styles.halfThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`market-post-${item.id}-0`}
              transition={0}
            />
            <Image
              source={{ uri: images[1] }}
              style={styles.halfThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`market-post-${item.id}-1`}
              transition={0}
            />
          </View>
        </View>
      );
    }

    if (imageCount === 3) {
      return (
        <View style={[styles.thumbnailWrap, { height: thumbHeight, backgroundColor: subtleBg }]}>
          <View style={styles.twoColumnGrid}>
            <Image
              source={{ uri: images[0] }}
              style={styles.fullHeightThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`market-post-${item.id}-0`}
              transition={0}
            />
            <View style={styles.twoRowColumn}>
              <Image
                source={{ uri: images[1] }}
                style={styles.halfRowThumb}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={`market-post-${item.id}-1`}
                transition={0}
              />
              <Image
                source={{ uri: images[2] }}
                style={styles.halfRowThumb}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={`market-post-${item.id}-2`}
                transition={0}
              />
            </View>
          </View>
        </View>
      );
    }

    // 4 or more images
    const remainingCount = imageCount - 3;
    return (
      <View style={[styles.thumbnailWrap, { height: thumbHeight, backgroundColor: subtleBg }]}>
        <View style={styles.twoColumnGrid}>
          <View style={styles.twoRowColumn}>
            <Image
              source={{ uri: images[0] }}
              style={styles.halfRowThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`market-post-${item.id}-0`}
              transition={0}
            />
            <Image
              source={{ uri: images[2] }}
              style={styles.halfRowThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`market-post-${item.id}-2`}
              transition={0}
            />
          </View>
          <View style={styles.twoRowColumn}>
            <Image
              source={{ uri: images[1] }}
              style={styles.halfRowThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`market-post-${item.id}-1`}
              transition={0}
            />
            <View style={styles.halfRowThumb}>
              <Image
                source={{ uri: images[3] }}
                style={styles.halfRowThumb}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={`market-post-${item.id}-3`}
                transition={0}
              />
              {remainingCount > 0 && (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>+{remainingCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.cardOuter,
        isCarousel ? styles.cardOuterCarousel : undefined,
        isCarousel ? { borderColor, ...CARD_BORDER } : undefined,
      ]}
    >
      <GuardedPressable
        style={[styles.card, { backgroundColor: cardBg }]}
        onPress={onPress}
        activeOpacity={0.85}
        delayPressIn={50}
        disabled={!onPress}
      >
        {renderThumbnail()}

        <View style={[styles.body, isService ? styles.bodyWithThumb : undefined]}>
          <View style={styles.topRow}>
            <View style={[styles.tag, { backgroundColor: tagBg }]}>
              <Text style={[styles.tagText, { color: tagColor }]}>{item.tag}</Text>
            </View>
            <Text style={[styles.postedAt, { color: mutedColor }]}>{timeLabel}</Text>
          </View>

          <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            style={[styles.description, { color: mutedColor }]}
            numberOfLines={isCarousel ? 2 : 3}
          >
            {item.description}
          </Text>

          <View style={[styles.footer, { borderTopColor: subtleBg }]}>
            {showAuthor ? (
              <>
                <View style={styles.authorRow}>
                  <View style={[styles.avatar, { backgroundColor: primaryColor + '22' }]}>
                    <Text style={[styles.avatarText, { color: primaryColor }]}>
                      {item.authorInitials}
                    </Text>
                  </View>
                  <Text style={[styles.authorName, { color: textColor }]} numberOfLines={1}>
                    {item.authorName}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: primaryColor }]}>{priceLabel}</Text>
                  <Ionicons name="chevron-forward" size={18} color={mutedColor} />
                </View>
              </>
            ) : (
              <View style={styles.priceOnlyRow}>
                <Text style={[styles.price, { color: primaryColor }]}>{priceLabel}</Text>
                <Ionicons name="chevron-forward" size={18} color={mutedColor} />
              </View>
            )}
          </View>
        </View>
      </GuardedPressable>
    </View>
  );
};

function areFeaturedPostCardPropsEqual(
  prev: FeaturedPostCardProps,
  next: FeaturedPostCardProps
): boolean {
  return (
    prev.item === next.item &&
    prev.layout === next.layout &&
    prev.cardBg === next.cardBg &&
    prev.subtleBg === next.subtleBg &&
    prev.textColor === next.textColor &&
    prev.mutedColor === next.mutedColor &&
    prev.primaryColor === next.primaryColor &&
    prev.borderColor === next.borderColor &&
    prev.showAuthor === next.showAuthor &&
    prev.onPress === next.onPress
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 16,
    marginBottom: Spacing.md,
    ...CARD_SHADOW,
  },
  cardOuterCarousel: {
    width: FEATURED_POST_CARD_CAROUSEL_WIDTH,
    marginBottom: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnailWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    gap: 2,
  },
  twoRowColumn: {
    flex: 1,
    gap: 2,
  },
  halfThumb: {
    flex: 1,
  },
  fullHeightThumb: {
    flex: 1,
  },
  halfRowThumb: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: Typography.size.lg,
    fontWeight: '800',
  },
  body: {
    padding: Spacing.md,
  },
  bodyWithThumb: {
    paddingTop: Spacing.sm + 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  tagText: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  postedAt: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  description: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.sm + 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
  },
  authorName: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priceOnlyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export const FeaturedPostCard = memo(FeaturedPostCardComponent, areFeaturedPostCardPropsEqual);
export { FeaturedPostCardSkeleton };
export default FeaturedPostCard;
