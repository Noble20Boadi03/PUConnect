import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, ListRenderItem } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing } from '../../constants';
import {
  POPULAR_SERVICES_MOCK,
  RECENTLY_VIEWED_MOCK,
  MARKET_PROMO,
} from '../../constants';
import { SectionHeader } from '../SectionHeader';
import { PopularServiceCard } from '../PopularServiceCard';
import { FeaturedPostCard } from '../FeaturedPostCard';
import { MarketPromoBanner } from '../MarketPromoBanner';
import type { PopularService, FeaturedPost } from '../../types';

const H_PAD = Spacing.lg;
const POPULAR_SEPARATOR = Spacing.sm + 4;
const CAROUSEL_SEPARATOR = Spacing.md;

export interface MarketFeedHeaderProps {
  cardBg: string;
  searchBg: string;
  textColor: string;
  iconColor: string;
  primaryColor: string;
}

const MarketFeedHeaderComponent: React.FC<MarketFeedHeaderProps> = ({
  cardBg,
  searchBg,
  textColor,
  iconColor,
  primaryColor,
}) => {
  const onPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const borderColor = useMemo(
    () => (cardBg === '#18181B' ? '#30363D' : 'rgba(0, 0, 0, 0.08)'),
    [cardBg]
  );

  const renderPopular: ListRenderItem<PopularService> = useCallback(
    ({ item }) => (
      <PopularServiceCard
        item={item}
        labelBg={cardBg}
        labelColor={textColor}
        onPress={onPress}
      />
    ),
    [cardBg, textColor, onPress]
  );

  const renderRecent: ListRenderItem<FeaturedPost> = useCallback(
    ({ item }) => (
      <FeaturedPostCard
        item={item}
        layout="carousel"
        onPress={onPress}
        cardBg={cardBg}
        subtleBg={searchBg}
        textColor={textColor}
        mutedColor={iconColor}
        primaryColor={primaryColor}
        borderColor={borderColor}
      />
    ),
    [cardBg, searchBg, textColor, iconColor, primaryColor, borderColor, onPress]
  );

  const popularKey = useCallback((item: PopularService) => item.id, []);
  const recentKey = useCallback((item: FeaturedPost) => item.id, []);

  return (
    <View>
      <View style={styles.block}>
        <View style={styles.heading}>
          <SectionHeader
            title="Popular Services"
            titleColor={textColor}
            actionColor={primaryColor}
            onActionPress={onPress}
          />
        </View>
        <FlatList
          data={POPULAR_SERVICES_MOCK}
          renderItem={renderPopular}
          keyExtractor={popularKey}
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          overScrollMode="never"
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
          removeClippedSubviews
          ItemSeparatorComponent={() => <View style={{ width: POPULAR_SEPARATOR }} />}
          contentContainerStyle={styles.hListContent}
        />
      </View>

      <View style={styles.block}>
        <View style={styles.heading}>
          <SectionHeader
            title="Recently Viewed"
            titleColor={textColor}
            actionColor={primaryColor}
            onActionPress={onPress}
          />
        </View>
        <FlatList
          data={RECENTLY_VIEWED_MOCK}
          renderItem={renderRecent}
          keyExtractor={recentKey}
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          overScrollMode="never"
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews
          ItemSeparatorComponent={() => <View style={{ width: CAROUSEL_SEPARATOR }} />}
          contentContainerStyle={styles.hListContent}
        />
      </View>

      <View style={styles.paddedBlock}>
        <MarketPromoBanner
          title={MARKET_PROMO.title}
          subtitle={MARKET_PROMO.subtitle}
          primaryColor={primaryColor}
        />
      </View>

      <View style={[styles.paddedBlock, styles.featuredHeading]}>
        <SectionHeader
          title="Featured Posts"
          titleColor={textColor}
          actionColor={primaryColor}
          onActionPress={onPress}
        />
      </View>
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
});

export const MarketFeedHeader = memo(MarketFeedHeaderComponent);

export default MarketFeedHeader;
