import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing } from '../../constants';
import {
  POPULAR_SERVICES_MOCK,
  RECENTLY_VIEWED_MOCK,
  MARKET_PROMO,
  FEATURED_POSTS_MOCK,
} from '../../constants';
import { SectionHeader } from '../SectionHeader';
import { PopularServiceCard } from '../PopularServiceCard';
import { FeaturedPostCard } from '../FeaturedPostCard';
import { MarketPromoBanner } from '../MarketPromoBanner';
import type { PopularService, FeaturedPost, MarketFilter } from '../../types';
import { useAppRouter } from '../../hooks';


const H_PAD = Spacing.lg;
const POPULAR_SEPARATOR = Spacing.sm + 4;
const CAROUSEL_SEPARATOR = Spacing.md;

export interface MarketFeedHeaderProps {
  cardBg: string;
  searchBg: string;
  textColor: string;
  iconColor: string;
  primaryColor: string;
  /** When false, only the Featured Posts heading is shown (filter active). */
  showDiscoverySections: boolean;
  /** Live posts from the API; when omitted, mock data is used. */
  posts?: FeaturedPost[];
  onPostPress: (post: FeaturedPost) => void;
  onSeeAllServicesPress?: () => void;
  onSeeAllRequestsPress?: () => void;
}

interface PopularRowProps {
  item: PopularService;
  labelBg: string;
  labelColor: string;
  onPress: () => void;
}

const PopularRow = memo(function PopularRow({
  item,
  labelBg,
  labelColor,
  onPress,
}: PopularRowProps) {
  return (
    <PopularServiceCard
      item={item}
      labelBg={labelBg}
      labelColor={labelColor}
      onPress={onPress}
    />
  );
});

interface RecentRowProps {
  item: FeaturedPost;
  cardBg: string;
  searchBg: string;
  textColor: string;
  iconColor: string;
  primaryColor: string;
  borderColor: string;
  onPostPress: (post: FeaturedPost) => void;
}

const RecentRow = memo(function RecentRow({
  item,
  cardBg,
  searchBg,
  textColor,
  iconColor,
  primaryColor,
  borderColor,
  onPostPress,
}: RecentRowProps) {
  return (
    <FeaturedPostCard
      item={item}
      layout="carousel"
      onPress={() => onPostPress(item)}
      cardBg={cardBg}
      subtleBg={searchBg}
      textColor={textColor}
      mutedColor={iconColor}
      primaryColor={primaryColor}
      borderColor={borderColor}
    />
  );
});

const MarketFeedHeaderComponent: React.FC<MarketFeedHeaderProps> = ({
  cardBg,
  searchBg,
  textColor,
  iconColor,
  primaryColor,
  showDiscoverySections,
  posts,
  onPostPress,
  onSeeAllServicesPress,
  onSeeAllRequestsPress,
}) => {
  const router = useAppRouter();

  const onPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const onSeeAllPopular = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/explore' as any);
  }, [router]);

  const onPopularServicePress = useCallback(
    (item: PopularService) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/category/${item.categoryId}/service/${item.id}` as any);
    },
    [router]
  );

  const borderColor = useMemo(
    () => (cardBg === '#18181B' ? '#30363D' : 'rgba(0, 0, 0, 0.08)'),
    [cardBg]
  );

  const recentCardProps = useMemo(
    () => ({
      cardBg,
      searchBg,
      textColor,
      iconColor,
      primaryColor,
      borderColor,
      onPostPress,
    }),
    [cardBg, searchBg, textColor, iconColor, primaryColor, borderColor, onPostPress]
  );

  const feedPosts = posts ?? FEATURED_POSTS_MOCK;
  const recentlyViewedPosts = posts ? feedPosts.slice(0, 5) : RECENTLY_VIEWED_MOCK;

  // Split posts into services and requests
  const servicePosts = useMemo(() => feedPosts.filter((p) => p.tag === 'Service'), [feedPosts]);
  const requestPosts = useMemo(() => feedPosts.filter((p) => p.tag === 'Request'), [feedPosts]);

  return (
    <View>
      {showDiscoverySections ? (
        <>
          <View style={styles.block}>
            <View style={styles.heading}>
              <SectionHeader
                title="Popular Services"
                titleColor={textColor}
                actionColor={primaryColor}
                onActionPress={onSeeAllPopular}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              overScrollMode="never"
              contentContainerStyle={styles.hListContent}
            >
              {POPULAR_SERVICES_MOCK.map((item, index) => (
                <View key={item.id} style={index > 0 ? styles.hItemGap : undefined}>
                  <PopularRow
                    item={item}
                    labelBg={cardBg}
                    labelColor={textColor}
                    onPress={() => onPopularServicePress(item)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.block}>
            <View style={styles.heading}>
              <SectionHeader
                title="Recently Viewed"
                titleColor={textColor}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              overScrollMode="never"
              contentContainerStyle={styles.hListContent}
            >
              {recentlyViewedPosts.map((item, index) => (
                <View key={item.id} style={index > 0 ? styles.hItemGapWide : undefined}>
                  <RecentRow item={item} {...recentCardProps} />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.paddedBlock}>
            <MarketPromoBanner
              title={MARKET_PROMO.title}
              subtitle={MARKET_PROMO.subtitle}
              primaryColor={primaryColor}
            />
          </View>

          {/* Services Subsection */}
          {servicePosts.length > 0 && (
            <View style={styles.block}>
              <View style={styles.heading}>
                <SectionHeader
                  title="Services"
                  titleColor={textColor}
                  actionColor={primaryColor}
                  onActionPress={onSeeAllServicesPress}
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                overScrollMode="never"
                contentContainerStyle={styles.hListContent}
              >
                {servicePosts.map((item, index) => (
                  <View key={item.id} style={index > 0 ? styles.hItemGapWide : undefined}>
                    <RecentRow item={item} {...recentCardProps} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Requests Subsection */}
          {requestPosts.length > 0 && (
            <View style={styles.block}>
              <View style={styles.heading}>
                <SectionHeader
                  title="Requests"
                  titleColor={textColor}
                  actionColor={primaryColor}
                  onActionPress={onSeeAllRequestsPress}
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                overScrollMode="never"
                contentContainerStyle={styles.hListContent}
              >
                {requestPosts.map((item, index) => (
                  <View key={item.id} style={index > 0 ? styles.hItemGapWide : undefined}>
                    <RecentRow item={item} {...recentCardProps} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    marginBottom: Spacing.lg,
  },
  paddedBlock: {
    paddingHorizontal: H_PAD,
    marginBottom: Spacing.lg,
  },
  featuredHeading: {
    marginBottom: Spacing.sm,
  },
  heading: {
    paddingHorizontal: H_PAD,
    marginBottom: Spacing.sm + 4,
  },
  hListContent: {
    paddingHorizontal: H_PAD,
    paddingVertical: Spacing.xs,
  },
  hItemGap: {
    marginLeft: POPULAR_SEPARATOR,
  },
  hItemGapWide: {
    marginLeft: CAROUSEL_SEPARATOR,
  },
});

export const MarketFeedHeader = memo(MarketFeedHeaderComponent);

export default MarketFeedHeader;
