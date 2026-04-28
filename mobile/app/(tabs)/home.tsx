import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, RefreshControl, ScrollView, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/use-responsive';
import { ListingCard } from '@/components/listing-card';
import { SearchBar } from '@/components/ui/search-bar';
import { useHomeViewModel } from '@/hooks/view-models/use-home-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useAuth } from '@/context/auth-context';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  horizontalPadding: { paddingLeft: number; paddingRight: number };
}

const SectionHeader = ({ title, onSeeAll, horizontalPadding }: SectionHeaderProps) => {
  return (
    <View style={[styles.sectionHeader, { paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight }]}>
      <ThemedText variant="titleLarge" style={styles.sectionTitle}>{title}</ThemedText>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <ThemedText variant="labelLarge" colorName="primary">See All</ThemedText>
        </Pressable>
      )}
    </View>
  );
};


export default function HomeScreen() {
  const { uiState, onRefresh, activeFilter, setActiveFilter } = useHomeViewModel();
  const { token } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const { isTablet, isLandscape, horizontalPadding } = useResponsive();
  const tabBarHeight = useTabBarHeight();

  const cardWidth = isTablet ? 240 : isLandscape ? 200 : 160;
  const categoryCardWidth = isTablet ? 180 : isLandscape ? 160 : 130;
  const gridCardWidth = (Dimensions.get('window').width - (horizontalPadding.paddingLeft + horizontalPadding.paddingRight) - Spacing.md) / 2;

  const isRefreshing = uiState.status === 'content' && !!uiState.isRefreshing;

  // Build the featured feed based on the active filter
  // This hook is moved here to follow the rules of hooks (no early returns before hooks)
  const featuredFeed = useMemo(() => {
    if (uiState.status !== 'content') return [];
    
    const { featuredOffers, featuredGigs } = uiState.data;

    if (activeFilter === 'Experts') {
      return featuredOffers.map(item => ({ type: 'offer' as const, data: item }));
    }
    if (activeFilter === 'Gigs') {
      return featuredGigs.map(item => ({ type: 'offer' as const, data: item }));
    }
    
    const feed: { type: 'offer' | 'gigRow'; data: any }[] = [];
    featuredOffers.forEach((item) => {
      feed.push({ type: 'offer', data: item });
    });

    return feed;
  }, [uiState, activeFilter]);

  if (uiState.status === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (uiState.status === 'error') {
    return (
      <ThemedView style={styles.centered}>
        <ThemedIcon name="alert-circle-outline" size={48} colorName="error" />
        <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={{ marginTop: Spacing.md }}>
          {uiState.message}
        </ThemedText>
      </ThemedView>
    );
  }

  if (uiState.status === 'empty') {
    return (
      <ThemedView style={styles.centered}>
        <ThemedIcon name="store-off-outline" size={48} colorName="outline" />
        <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={{ marginTop: Spacing.md }}>
          No {activeFilter === 'All' ? 'items' : activeFilter} available matching your criteria.
        </ThemedText>
        <Pressable onPress={onRefresh} style={{ marginTop: Spacing.md }}>
          <ThemedText colorName="primary">Refresh</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (uiState.status !== 'content') return null;
  const { popular, trending } = uiState.data;

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      {/* Fixed Sticky Header */}
      <ThemedView
        style={[
          styles.fixedHeader,
          { paddingTop: insets.top + Spacing.sm }
        ]}
      >
        <View style={[styles.topRow, horizontalPadding]}>
          <ThemedText variant="headlineSmall" style={[styles.brandLogo, { fontWeight: '900' }]}>
            PuConnect<ThemedText colorName="primary" style={{ fontWeight: '900' }}>.</ThemedText>
          </ThemedText>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Experts or Gigs"
          onSubmit={() => router.push({ pathname: '/search/results', params: { q: searchQuery.trim() } })}
          containerStyle={{ marginHorizontal: horizontalPadding.paddingLeft }}
        />

      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + Spacing.xl }
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Trending This Week Section */}
        <SectionHeader
          title="Trending this week"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'trending' } })}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: horizontalPadding.paddingLeft,
            paddingRight: horizontalPadding.paddingRight,
            gap: Spacing.md,
          }}
          style={styles.horizontalSection}
        >
          {trending.map((item) => (
            <ListingCard
              key={`trend-${item.id}`}
              listing={item}
              width={cardWidth}
              onPress={() => router.push({ 
                  pathname: '/search/listings/[subcategory]', 
                  params: { 
                      subcategory: item.subcategory || 'Subject Tutoring', 
                      category: item.category || 'Academics & Language' 
                  } 
              })}
            />
          ))}
        </ScrollView>

        {/* Featured Posts Section */}
        <SectionHeader
          title="Featured posts"
          horizontalPadding={horizontalPadding}
        />
        <View style={[styles.featuredFeed, horizontalPadding]}>
          {featuredFeed.map((entry, index) => {
            return (
              <ListingCard
                key={`feat-${entry.data.id}`}
                listing={entry.data}
                width={gridCardWidth}
                onPress={() => router.push({ 
                    pathname: '/search/listings/[subcategory]', 
                    params: { 
                        subcategory: entry.data.subcategory || 'Subject Tutoring', 
                        category: entry.data.category || 'Academics & Language' 
                    } 
                })}
              />
            );
          })}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedHeader: {
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandLogo: {
    fontWeight: '800',
  },
  gridBtn: {
    padding: Spacing.xs,
  },
  pillsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  pillText: {
    fontWeight: '600',
  },
  discoveryTip: {
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  scrollContent: {
    paddingTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  horizontalSection: {
    marginBottom: Spacing.sm,
  },
  featuredFeed: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
});
