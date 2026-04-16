import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, RefreshControl, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/use-responsive';
import { ListingCard } from '@/components/listing-card';
import { SearchBar } from '@/components/ui/search-bar';
import { useHomeViewModel } from '@/hooks/view-models/use-home-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useAuth } from '@/context/auth-context';
import { useAppAlert } from '@/context/alert-context';

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

const PromotionBanner = ({ horizontalPadding }: { horizontalPadding: { paddingLeft: number; paddingRight: number } }) => {
  const { theme } = useTheme();
  const { showAlert } = useAppAlert();
  return (
    <View style={{ ...horizontalPadding, marginVertical: Spacing.xl }}>
      <LinearGradient
        colors={[theme.primary, theme.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promoBanner}
      >
        <View style={styles.promoContent}>
          <ThemedText variant="titleMedium" lightColor="#ffffff" darkColor={theme.onPrimaryContainer} style={styles.promoTitle}>
            Invite friends & get rewards
          </ThemedText>
          <ThemedText variant="bodySmall" lightColor="#ffffff" darkColor={theme.onPrimaryContainer} style={styles.promoSub}>
            Spread the word and help your campus community build together.
          </ThemedText>
          <Pressable
            onPress={() =>
              showAlert({ title: 'Invite friends', subtitle: 'Referral rewards will be available in a future update.', severity: 'info' })
            }
            style={[styles.promoBtn, { backgroundColor: theme.background }]}
          >
            <ThemedText variant="labelLarge" colorName="primary">Invite now →</ThemedText>
          </Pressable>
        </View>
        <View style={styles.promoIcon}>
          <ThemedIcon name="gift-outline" size={60} lightColor="rgba(255,255,255,0.2)" darkColor="rgba(0,0,0,0.1)" />
        </View>
      </LinearGradient>
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

  // In landscape, cards can be wider since there's more horizontal space
  const cardWidth = isTablet ? 240 : isLandscape ? 200 : 160;

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

  const { popular, recommended, recent, trending, lastOrderRecs } = uiState.data;

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
          <ThemedText variant="headlineSmall" style={styles.brandLogo}>
            PuConnect<ThemedText colorName="primary">.</ThemedText>
          </ThemedText>
          <Pressable
            style={styles.gridBtn}
            onPress={() => (token ? router.push('/listing/create') : router.push('/login'))}
          >
            <ThemedIcon name="apps" size={24} />
          </Pressable>
        </View>

        {/* Search Bar Row */}
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
          { paddingBottom: tabBarHeight }
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Popular Section */}
        <SectionHeader
          title="Popular"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'popular' } })}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {popular.map((item) => (
            <ListingCard 
              key={`popular-${item.id}`} 
              listing={item} 
              width={cardWidth}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Recommended For You Section */}
        <SectionHeader
          title="Recommended for you"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'recommended' } })}
        />
        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.sectionSub, horizontalPadding]}>
          Handpicked based on your interests
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {recommended.map((item) => (
            <ListingCard 
              key={`rec-${item.id}`} 
              listing={item} 
              width={cardWidth}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Promotion Banner */}
        <PromotionBanner horizontalPadding={horizontalPadding} />

        {/* Recently Viewed Section */}
        <SectionHeader
          title="Recently viewed"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'recent' } })}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {recent.map((item) => (
            <ListingCard 
              key={`recent-${item.id}`} 
              listing={item} 
              width={cardWidth}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Based on Last Order Section */}
        <SectionHeader
          title="You might also like"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'lastOrder' } })}
        />
        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.sectionSub, horizontalPadding]}>
          Based on your previous interactions
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {lastOrderRecs.map((item) => (
            <ListingCard 
              key={`last-${item.id}`} 
              listing={item} 
              width={cardWidth}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Trending Section */}
        <SectionHeader
          title="Trending this week"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'trending' } })}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {trending.map((item) => (
            <ListingCard 
              key={`trend-${item.id}`} 
              listing={item} 
              width={cardWidth}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  sectionSub: {
    marginBottom: Spacing.md,
  },
  horizontalSection: {
    marginBottom: Spacing.sm,
  },
  promoBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    zIndex: 1,
  },
  promoTitle: {
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  promoSub: {
    marginBottom: Spacing.lg,
    opacity: 0.9,
  },
  promoBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  promoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
});

