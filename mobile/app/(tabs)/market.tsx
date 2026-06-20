import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAppRouter, useThemeColor, useTabBarHeight, useDebounce, usePullToRefreshOnHeader, useMarket } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { MarketHeaderTop, MarketFeedHeader, FeaturedPostCard, MarketViewSkeleton } from '../../components';
import type { FeaturedPost, MarketFilter } from '../../types';
import { useAuthStore } from '../../store';

/**
 * Market feed backed by GET /api/posts. Popular services and promo sections
 * still use static UI content; post carousels and filtered lists use live data.
 */
export default function MarketScreen() {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tabBarHeight = useTabBarHeight();

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const searchBg = isDark ? '#1E1E21' : '#F0F0F2';
  const borderColor = isDark ? '#30363D' : 'rgba(0, 0, 0, 0.08)';

  const user = useAuthStore((s) => s.user);
  const { 
    posts, 
    isLoading, 
    isRefreshing, 
    isLoadingMore, 
    error, 
    fetchPosts, 
    loadMorePosts, 
    searchPosts, 
    setFilter, 
    activeFilter,
    searchQuery,
    initializeRecentlyViewed,
    recentlyViewedIds
  } = useMarket();

  const [showMarketTip, setShowMarketTip] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(localSearchQuery, 400);

  // Sync local search query with store search query on debounce
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      searchPosts(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchQuery, searchPosts]);

  const onRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const { panHandlers } = usePullToRefreshOnHeader({ onRefresh, isRefreshing });

  useEffect(() => {
    fetchPosts();
    initializeRecentlyViewed();
  }, [fetchPosts, initializeRecentlyViewed]);

  const toggleTip = useCallback(() => {
    setShowMarketTip(prev => !prev);
  }, []);

  const handleFilterChange = useCallback((filter: MarketFilter) => {
    setFilter(filter);
  }, [setFilter]);

  const handleSearchChange = useCallback((query: string) => {
    setLocalSearchQuery(query);
  }, []);

  const handleCardPress = useCallback(
    (post: FeaturedPost) => {
      const isOwner = user?.id === post.authorId;
      router.push(`/post/${post.id}${isOwner ? '?fromOwner=1' : ''}` as any);
    },
    [router, user]
  );

  const handleSeeAllServices = useCallback(() => {
    setFilter('services');
  }, [setFilter]);

  const handleSeeAllRequests = useCallback(() => {
    setFilter('requests');
  }, [setFilter]);

  const showDiscoverySections = activeFilter === 'all' && !searchQuery;

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
      searchQuery: localSearchQuery,
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
      localSearchQuery,
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
      recentlyViewedIds,
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
      recentlyViewedIds,
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

  const keyExtractor = useCallback((item: FeaturedPost) => item.id, []);

  const renderItem = useCallback(({ item }: { item: FeaturedPost }) => {
    return (
      <View style={styles.featuredItem}>
        <FeaturedPostCard
          item={item}
          layout="stack"
          onPress={() => handleCardPress(item)}
          {...postCardTheme}
        />
      </View>
    );
  }, [handleCardPress, postCardTheme]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isLoadingMore, Colors.primary]);

  const renderEmptyComponent = useCallback(() => {
    if (showDiscoverySections || isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: Colors.icon }]}>{emptyMessage}</Text>
      </View>
    );
  }, [showDiscoverySections, isLoading, Colors.icon, emptyMessage]);

  const ListHeaderComponent = useCallback(() => (
    <>
      {error ? (
        <View style={styles.errorState}>
          <Text style={[styles.errorText, { color: Colors.icon }]}>{error}</Text>
        </View>
      ) : null}
      <MarketFeedHeader {...feedHeaderTheme} />
    </>
  ), [error, Colors.icon, feedHeaderTheme]);

  const onEndReached = useCallback(() => {
    loadMorePosts();
  }, [loadMorePosts]);

  if (isLoading) {
    return <MarketViewSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <View {...panHandlers}>
        <MarketHeaderTop {...headerTheme} />
      </View>
      <FlatList
        data={showDiscoverySections ? [] : posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        overScrollMode="never"
        removeClippedSubviews
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
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
  scrollContent: {
    paddingTop: Spacing.lg,
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
  footer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
