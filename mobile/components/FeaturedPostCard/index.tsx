import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, CARD_SHADOW, CARD_BORDER } from '../../constants';
import type { FeaturedPost } from '../../types';

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
  onPress?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
export const FEATURED_POST_CARD_CAROUSEL_WIDTH = SCREEN_WIDTH * 0.82;

const FeaturedPostCardComponent: React.FC<FeaturedPostCardProps> = ({
  item,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  borderColor = 'rgba(0, 0, 0, 0.08)',
  layout = 'stack',
  onPress,
}) => {
  const isCarousel = layout === 'carousel';
  const isRequest = item.tag === 'Request';
  const tagBg = isRequest ? '#F59E0B18' : `${primaryColor}18`;
  const tagColor = isRequest ? '#F59E0B' : primaryColor;
  const timeLabel = item.viewedAt ? `Viewed ${item.viewedAt}` : item.postedAt;

  return (
    <View
      style={[
        styles.cardOuter,
        isCarousel ? styles.cardOuterCarousel : undefined,
        isCarousel
          ? { borderColor, ...CARD_BORDER }
          : undefined,
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
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
            <Text style={[styles.price, { color: primaryColor }]}>{item.priceLabel}</Text>
            <Ionicons name="chevron-forward" size={18} color={mutedColor} />
          </View>
        </View>
      </TouchableOpacity>
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
    width: FEATURED_POST_CARD_CAROUSEL_WIDTH,
    marginBottom: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    overflow: 'hidden',
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
  price: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export const FeaturedPostCard = memo(FeaturedPostCardComponent);

export default FeaturedPostCard;
