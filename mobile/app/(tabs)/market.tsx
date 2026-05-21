import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useAppRouter, useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { FEATURED_POSTS_MOCK } from '../../constants';
import { MarketHeader, MarketFeedHeader, FeaturedPostCard } from '../../components';
import { filterMarketPosts } from '../../lib';
import type { FeaturedPost, MarketFilter } from '../../types';

/**
 * Market uses a single ScrollView (mock data is small) to avoid nested
 * VirtualizedLists, which cause slow updates and jank after resume.
 */
export default function MarketScreen() {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const searchBg = isDark ? '#1E1E21' : '#F0F0F2';
  const borderColor = isDark ? '#30363D' : 'rgba(0, 0, 0, 0.08)';

  const [showMarketTip, setShowMarketTip] = useState(true);
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');

  const dismissTip = useCallback(() => {
    setShowMarketTip(false);
  }, []);

  const handleFilterChange = useCallback((filter: MarketFilter) => {
    setActiveFilter(filter);
  }, []);

  const handleCardPress = useCallback(
    (post: FeaturedPost) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/post/${post.id}` as any);
    },
    [router]
  );

  const showDiscoverySections = activeFilter === 'all';

  const filteredPosts = useMemo(
    () => filterMarketPosts(FEATURED_POSTS_MOCK, activeFilter),
    [activeFilter]
  );

  const emptyMessage = useMemo(() => {
    switch (activeFilter) {
      case 'services':
        return 'No service posts match this filter yet.';
      case 'requests':
        return 'No request posts match this filter yet.';
      default:
        return 'No posts to show right now.';
    }
  }, [activeFilter]);

  const headerTheme = useMemo(
    () => ({
      textColor: Colors.text,
      iconColor: Colors.icon,
      primaryColor: Colors.primary,
      borderColor: Colors.border,
      cardBg,
      searchBg,
      showTip: showMarketTip,
      onDismissTip: dismissTip,
      activeFilter,
      onFilterChange: handleFilterChange,
    }),
    [
      Colors.text,
      Colors.icon,
      Colors.primary,
      Colors.border,
      cardBg,
      searchBg,
      showMarketTip,
      dismissTip,
      activeFilter,
      handleFilterChange,
    ]
  );

  const feedHeaderTheme = useMemo(
    () => ({
      cardBg,
      searchBg,
      textColor: Colors.text,
      iconColor: Colors.icon,
      primaryColor: Colors.primary,
      showDiscoverySections,
      onPostPress: handleCardPress,
    }),
    [
      cardBg,
      searchBg,
      Colors.text,
      Colors.icon,
      Colors.primary,
      showDiscoverySections,
      handleCardPress,
    ]
  );

  const postCardTheme = useMemo(
    () => ({
      cardBg,
      subtleBg: searchBg,
      textColor: Colors.text,
      mutedColor: Colors.icon,
      primaryColor: Colors.primary,
      borderColor,
    }),
    [cardBg, searchBg, Colors.text, Colors.icon, Colors.primary, borderColor]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.root}>
        <MarketHeader {...headerTheme} />

        <ScrollView
          style={[styles.scroll, { backgroundColor: screenBg }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          overScrollMode="never"
          removeClippedSubviews
        >
          <MarketFeedHeader {...feedHeaderTheme} />

          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: Colors.icon }]}>{emptyMessage}</Text>
            </View>
          ) : (
            filteredPosts.map((item) => (
              <View key={item.id} style={styles.featuredItem}>
                <FeaturedPostCard
                  item={item}
                  layout="stack"
                  onPress={() => handleCardPress(item)}
                  {...postCardTheme}
                />
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  featuredItem: {
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});
