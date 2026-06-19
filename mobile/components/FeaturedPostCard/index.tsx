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

// Adjusted thumbnail heights for smaller card size
const THUMBNAIL_HEIGHT_STACK = SCREEN_WIDTH * 0.4;
const THUMBNAIL_HEIGHT_CAROUSEL = FEATURED_POST_CARD_CAROUSEL_WIDTH * 0.4;

// Calculate body height with exact values from Spacing/Typography
const BODY_PADDING = Spacing.md * 2; // 32
const TOP_ROW_HEIGHT = 30; // Estimated height of tag + posted date
const TOP_ROW_MARGIN_BOTTOM = Spacing.sm; // 8
const TITLE_HEIGHT = 22 * 2; // 2 lines × lineHeight 22
const TITLE_MARGIN_BOTTOM = Spacing.xs; // 4
const DESCRIPTION_HEIGHT = 20 * 3; // 3 lines × lineHeight 20
const DESCRIPTION_MARGIN_BOTTOM = Spacing.md; //16
const FOOTER_PADDING_TOP = Spacing.sm + 4; // 12
const FOOTER_BORDER_WIDTH = 1;
const FOOTER_CONTENT_HEIGHT = 40; // Estimated height of author row + price row
const SERVICE_BODY_HEIGHT = 
  BODY_PADDING +
  TOP_ROW_HEIGHT +
  TOP_ROW_MARGIN_BOTTOM +
  TITLE_HEIGHT +
  TITLE_MARGIN_BOTTOM +
  DESCRIPTION_HEIGHT +
  DESCRIPTION_MARGIN_BOTTOM +
  FOOTER_PADDING_TOP +
  FOOTER_BORDER_WIDTH +
  FOOTER_CONTENT_HEIGHT;

// Total card heights (both service and request are now the same height: 30% smaller than original service card height)
const CARD_TOTAL_HEIGHT_STACK = (THUMBNAIL_HEIGHT_STACK + SERVICE_BODY_HEIGHT) * 0.7;
const CARD_TOTAL_HEIGHT_CAROUSEL = (THUMBNAIL_HEIGHT_CAROUSEL + SERVICE_BODY_HEIGHT) * 0.7;

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
  const thumbnailHeight = isCarousel ? THUMBNAIL_HEIGHT_CAROUSEL : THUMBNAIL_HEIGHT_STACK;
  const totalCardHeight = isCarousel ? CARD_TOTAL_HEIGHT_CAROUSEL : CARD_TOTAL_HEIGHT_STACK;

  const renderSquareImages = (images: string[]) => {
    const imageCount = images.length;

    if (imageCount === 1) {
      return (
        <View style={[styles.thumbnailWrap, { height: thumbnailHeight, backgroundColor: subtleBg }]}>
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
        <View style={[styles.thumbnailWrap, { height: thumbnailHeight, backgroundColor: subtleBg }]}>
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
        <View style={[styles.thumbnailWrap, { height: thumbnailHeight, backgroundColor: subtleBg }]}>
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
      <View style={[styles.thumbnailWrap, { height: thumbnailHeight, backgroundColor: subtleBg }]}>
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

  const renderThumbnailArea = () => {
    if (!isService) return null;
    const images = ('images' in item && item.images) ? item.images : [item.thumbnail];
    return renderSquareImages(images);
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
        {isService ? (
          <View style={{ height: totalCardHeight, overflow: 'hidden' }}>
            {renderThumbnailArea()}
            <View style={styles.body}>
              <View style={styles.topRow}>
                <View style={[styles.tag, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color: tagColor }]}>{item.tag}</Text>
                </View>
                <Text style={[styles.postedAt, { color: mutedColor }]}>{timeLabel}</Text>
              </View>

              <Text style={[styles.title, { color: textColor }]} numberOfLines={2} ellipsizeMode="tail">
                {item.title}
              </Text>
              <Text
                style={[styles.description, { color: mutedColor }]}
                numberOfLines={2}
                ellipsizeMode="tail"
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
          </View>
        ) : (
          <View style={[styles.requestBody, { height: totalCardHeight, overflow: 'hidden', backgroundColor: cardBg }]}>
            {/* Decorative background element */}
            <View style={[styles.requestBackground, { backgroundColor: tagBg + '30' }]} />
            
            <View style={styles.requestInner}>
              <View style={styles.topRow}>
                <View style={[styles.tag, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color: tagColor }]}>{item.tag}</Text>
                </View>
                <Text style={[styles.postedAt, { color: mutedColor }]}>{timeLabel}</Text>
              </View>

              <View style={styles.requestContent}>
                <Text style={[styles.requestTitle, { color: textColor }]} numberOfLines={2} ellipsizeMode="tail">
                  {item.title}
                </Text>
                <Text
                  style={[styles.requestDescription, { color: mutedColor }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              </View>

              <View style={[styles.requestFooter, { borderTopColor: subtleBg }]}>
                {showAuthor ? (
                  <View style={styles.requestAuthorSection}>
                    <View style={[styles.requestAvatar, { backgroundColor: primaryColor + '30' }]}>
                      <Text style={[styles.requestAvatarText, { color: primaryColor }]}>
                        {item.authorInitials}
                      </Text>
                    </View>
                    <Text style={[styles.requestAuthorName, { color: textColor }]} numberOfLines={1}>
                      {item.authorName}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.requestPriceSection}>
                  <Text style={[styles.requestPrice, { color: tagColor }]}>{priceLabel}</Text>
                  <Ionicons name="chevron-forward" size={18} color={mutedColor} />
                </View>
              </View>
            </View>
          </View>
        )}
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
    padding: Spacing.sm,
  },
  requestBody: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  requestBackground: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.4,
  },
  requestInner: {
    flex: 1,
    padding: Spacing.md,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  requestTopSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  requestIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  requestMeta: {
    flex: 1,
    flexDirection: 'column',
    gap: Spacing.xs,
    paddingTop: 2,
  },
  requestTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  requestTagText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  requestDate: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  requestContent: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
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
    fontSize: Typography.size.sm,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginBottom: 2,
    lineHeight: 18,
  },
  requestTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  description: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  requestDescription: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.sm + 2,
    marginTop: Spacing.sm,
  },
  requestAuthorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  requestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestAvatarText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
  },
  requestAuthorName: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  requestPriceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  requestPrice: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.xs + 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
  },
  authorName: {
    fontSize: Typography.size.xs,
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
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
});

export const FeaturedPostCard = memo(FeaturedPostCardComponent, areFeaturedPostCardPropsEqual);
export { FeaturedPostCardSkeleton };
export default FeaturedPostCard;
