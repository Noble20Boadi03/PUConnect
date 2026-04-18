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
import { PopularCategoryCard } from '@/components/popular-category-card';
import { GigSpotlightRow } from '@/components/gig-spotlight-row';
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

const HomeFilterPills = ({ activeFilter, onFilterChange }: { activeFilter: 'All' | 'Experts' | 'Gigs', onFilterChange: (filter: 'All' | 'Experts' | 'Gigs') => void }) => {
  const { theme } = useTheme();
  const filters: ('All' | 'Experts' | 'Gigs')[] = ['All', 'Experts', 'Gigs'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillsContainer}
    >
      {filters.map((filter) => {
        const isSelected = activeFilter === filter;
        return (
          <Pressable
            key={filter}
            style={[
              styles.pill,
              { borderColor: theme.outlineVariant },
              isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => onFilterChange(filter)}
          >
            <ThemedText
              variant="labelLarge"
              style={[styles.pillText, isSelected && { color: theme.onPrimary }]}
              colorName={isSelected ? undefined : 'textMuted'}
            >
              {filter}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
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

  const { popular, trending, featuredOffers, featuredGigs } = uiState.data;

  // Build the featured feed based on the active filter
  const featuredFeed = useMemo(() => {
    if (activeFilter === 'Experts') {
      // Only offers, displayed vertically
      return featuredOffers.map(item => ({ type: 'offer' as const, data: item }));
    }
    if (activeFilter === 'Gigs') {
      // Only gigs, displayed vertically (standard layout)
      return featuredGigs.map(item => ({ type: 'offer' as const, data: item }));
    }
    // "All" filter: offers vertically, with gig spotlight rows interspersed
    const feed: { type: 'offer' | 'gigRow'; data: any }[] = [];
    let gigInserted = false;
    featuredOffers.forEach((item, index) => {
      feed.push({ type: 'offer', data: item });
      // Insert a gig spotlight row after every 3 offers
      if ((index + 1) % 3 === 0 && featuredGigs.length > 0 && !gigInserted) {
        feed.push({ type: 'gigRow', data: featuredGigs });
        gigInserted = true;
      }
    });
    // If we never inserted gigs (fewer than 3 offers), add them at the end
    if (!gigInserted && featuredGigs.length > 0) {
      feed.push({ type: 'gigRow', data: featuredGigs });
    }
    return feed;
  }, [activeFilter, featuredOffers, featuredGigs]);

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
          <Pressable
            style={styles.gridBtn}
            onPress={() => (token ? router.push('/listing/create') : router.push('/login'))}
          >
            <ThemedIcon name="apps" size={24} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Experts or Gigs"
          onSubmit={() => router.push({ pathname: '/search/results', params: { q: searchQuery.trim() } })}
          containerStyle={{ marginHorizontal: horizontalPadding.paddingLeft }}
        />

        {/* Filters */}
        <HomeFilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.discoveryTip, horizontalPadding]}>
          {activeFilter === 'All'
            ? 'Tip: Browse Experts for professional help or Gigs to find students who need your skills.'
            : activeFilter === 'Experts'
            ? 'Tip: Experts are students offering professional services. Hire them to get your tasks done.'
            : 'Tip: Gigs are requests from students who need help. Apply to these to earn and build your portfolio.'}
        </ThemedText>
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
        {/* Popular Services Section */}
        <SectionHeader
          title="Popular Services"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'popular' } })}
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
          {popular.map((item) => (
            <PopularCategoryCard
              key={`cat-${item.category.id}`}
              title={item.category.title}
              icon={item.category.icon}
              colors={item.colors}
              width={categoryCardWidth}
              onPress={() => router.push({ pathname: '/search/[id]', params: { id: item.category.id } })}
            />
          ))}
        </ScrollView>

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
              onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
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
            if (entry.type === 'gigRow') {
              return (
                <GigSpotlightRow
                  key={`gig-row-${index}`}
                  gigs={entry.data as any[]}
                  cardWidth={cardWidth}
                  horizontalPadding={horizontalPadding}
                />
              );
            }
            return (
              <ListingCard
                key={`feat-${entry.data.id}`}
                listing={entry.data}
                width={gridCardWidth}
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: entry.data.id } })}
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
