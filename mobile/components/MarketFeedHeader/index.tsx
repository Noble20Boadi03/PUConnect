import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing } from '../../constants';
import {
  MARKET_PROMO,
  FEATURED_POSTS_MOCK,
} from '../../constants';
import { SectionHeader } from '../SectionHeader';
import { PopularServiceCard } from '../PopularServiceCard';
import { FeaturedPostCard } from '../FeaturedPostCard';
import { MarketPromoBanner } from '../MarketPromoBanner';
import type { FeaturedPost, MarketFilter, DbCategoryServiceWithCategory, ExploreCategoryService } from '../../types';
import { useAppRouter } from '../../hooks';
import { buildExploreServiceHref } from '../../lib';
import { useMarketStore } from '../../store';


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
  recentlyViewedIds: string[];
  onPostPress: (post: FeaturedPost) => void;
  onSeeAllServicesPress?: () => void;
  onSeeAllRequestsPress?: () => void;
}

interface PopularRowProps {
  item: DbCategoryServiceWithCategory;
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
  recentlyViewedIds,
  onPostPress,
  onSeeAllServicesPress,
  onSeeAllRequestsPress,
}) => {
  const router = useAppRouter();
  const { popularServices, popularServicesLoading, fetchPopularServices } = useMarketStore();

  useEffect(() => {
    if (showDiscoverySections) {
      fetchPopularServices();
    }
  }, [showDiscoverySections, fetchPopularServices]);

  const onSeeAllPopular = useCallback(() => {
    router.push('/(tabs)/explore' as any);
  }, [router]);

  const onPopularServicePress = useCallback(
    (service: ExploreCategoryService, categoryId: string) => {
      router.push(buildExploreServiceHref(categoryId, service.id) as any);
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

  // Derive recently viewed posts by tag, preserving order
  const { recentlyViewedServices, recentlyViewedRequests } = useMemo(() => {
    const services: FeaturedPost[] = [];
    const requests: FeaturedPost[] = [];
    
    for (const id of recentlyViewedIds) {
      const post = feedPosts.find(p => p.id === id);
      if (post) {
        if (post.tag === 'Service' && services.length < 5) {
          services.push(post);
        } else if (post.tag === 'Request' && requests.length < 5) {
          requests.push(post);
        }
      }
    }
    
    return { recentlyViewedServices: services, recentlyViewedRequests: requests };
  }, [feedPosts, recentlyViewedIds]);

  return (
    <View>
      {showDiscoverySections ? (
        <>
          <View style={styles.paddedBlock}>
            <MarketPromoBanner
              title={MARKET_PROMO.title}
              subtitle={MARKET_PROMO.subtitle}
              primaryColor={primaryColor}
            />
          </View>

          <View style={styles.block}>
            <View style={styles.heading}>
              <SectionHeader
                title="Popular Services"
                titleColor={textColor}
                actionColor={primaryColor}
                onActionPress={onSeeAllPopular}
              />
            </View>
            {popularServicesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={primaryColor} />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                overScrollMode="never"
                contentContainerStyle={styles.hListContent}
              >
                {popularServices.map((item, index) => (
                  <View key={item.id} style={index > 0 ? styles.hItemGap : undefined}>
                    <PopularRow
                      item={item}
                      labelBg={cardBg}
                      labelColor={textColor}
                      onPress={() => onPopularServicePress(item.service, item.categoryId)}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Recently Viewed Services */}
          {recentlyViewedServices.length > 0 && (
            <View style={styles.block}>
              <View style={styles.heading}>
                <SectionHeader
                  title="Recently Viewed Services"
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
                {recentlyViewedServices.map((item, index) => (
                  <View key={item.id} style={index > 0 ? styles.hItemGapWide : undefined}>
                    <RecentRow item={item} {...recentCardProps} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recently Viewed Requests */}
          {recentlyViewedRequests.length > 0 && (
            <View style={styles.block}>
              <View style={styles.heading}>
                <SectionHeader
                  title="Recently Viewed Requests"
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
                {recentlyViewedRequests.map((item, index) => (
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
  loadingContainer: {
    paddingHorizontal: H_PAD,
    paddingVertical: Spacing.lg,
  },
});

export const MarketFeedHeader = memo(MarketFeedHeaderComponent);

export default MarketFeedHeader;
