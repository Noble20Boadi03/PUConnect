import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useAppRouter, useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { MarketHeaderTop, MarketFeedHeader, FeaturedPostCard, MarketViewSkeleton } from '../../components';
import { filterMarketPosts } from '../../lib';
import type { FeaturedPost, MarketFilter } from '../../types';
import { useAuthStore } from '../../store';
import { useMarketStore } from '../../store/marketStore';

/**
 * Market feed backed by GET /api/posts. Popular services and promo sections
 * still use static UI content; post carousels and filtered lists use live data.
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

  const user = useAuthStore((s) => s.user);
  const { posts, isLoading, isRefreshing, error, fetchPosts } = useMarketStore();

  const [showMarketTip, setShowMarketTip] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleTip = useCallback(() => {
    setShowMarketTip(prev => !prev);
  }, []);

  const handleFilterChange = useCallback((filter: MarketFilter) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCardPress = useCallback(
    (post: FeaturedPost) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const isOwner = user?.id === post.authorId;
      router.push(`/post/${post.id}${isOwner ? '?fromOwner=1' : ''}` as any);
    },
    [router, user]
  );

  const handleSeeAllServices = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter('services');
  }, []);

  const handleSeeAllRequests = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter('requests');
  }, []);

  const showDiscoverySections = activeFilter === 'all' && !searchQuery;

  const filteredPosts = useMemo(
    () => filterMarketPosts(posts, activeFilter, searchQuery),
    [posts, activeFilter, searchQuery]
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
      onDismissTip: toggleTip,
      activeFilter,
      onFilterChange: handleFilterChange,
      searchQuery,
      onSearchChange: handleSearchChange,
    }),
    [
      Colors.text,
      Colors.icon,
      Colors.primary,
      Colors.border,
      cardBg,
      searchBg,
      showMarketTip,
      toggleTip,
      activeFilter,
      handleFilterChange,
      searchQuery,
      handleSearchChange,
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
      posts,
      onPostPress: handleCardPress,
      onSeeAllServicesPress: handleSeeAllServices,
      onSeeAllRequestsPress: handleSeeAllRequests,
    }),
    [
      cardBg,
      searchBg,
      Colors.text,
      Colors.icon,
      Colors.primary,
      showDiscoverySections,
      posts,
      handleCardPress,
      handleSeeAllServices,
      handleSeeAllRequests,
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

  if (isLoading) {
    return <MarketViewSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <MarketHeaderTop {...headerTheme} />
      <ScrollView
        style={[styles.scroll, { backgroundColor: screenBg }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        overScrollMode="never"
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorState}>
            <Text style={[styles.errorText, { color: Colors.icon }]}>{error}</Text>
          </View>
        ) : null}

        <MarketFeedHeader {...feedHeaderTheme} />

        {!showDiscoverySections && filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: Colors.icon }]}>{emptyMessage}</Text>
          </View>
        ) : !showDiscoverySections ? (
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
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorState: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: 120,
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
