import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, RefreshControl, ScrollView, Pressable, Dimensions, Image } from 'react-native';
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
import { RequestCard } from '@/components/request-card';
import { PopularCategoryCard } from '@/components/popular-category-card';

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

const HomeFilterPills = ({ activeFilter, onFilterChange }: { activeFilter: 'All' | 'Services' | 'Requests', onFilterChange: (filter: 'All' | 'Services' | 'Requests') => void }) => {
  const { theme } = useTheme();
  const filters: ('All' | 'Services' | 'Requests')[] = ['All', 'Services', 'Requests'];

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
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const { isTablet, isLandscape, horizontalPadding } = useResponsive();
  const tabBarHeight = useTabBarHeight();


  const cardWidth = isTablet ? 360 : isLandscape ? 320 : 280;
  const categoryCardWidth = isTablet ? 240 : isLandscape ? 220 : (Dimensions.get('window').width - horizontalPadding.paddingLeft) / 2.3;

  const isRefreshing = uiState.status === 'content' && !!uiState.isRefreshing;
  const isAdmin = user?.role === 'admin';

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
  const { popularSubcategories, recentlyViewed, featuredServices, featuredRequests } = uiState.data;

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      {/* Fixed Sticky Header */}
      <ThemedView
        style={[
          styles.fixedHeader,
          { paddingTop: insets.top + Spacing.xs }
        ]}
      >
        <View style={[styles.topRow, horizontalPadding]}>
          <ThemedText variant="headlineSmall" style={[styles.brandLogo, { fontWeight: '900' }]}>
            PuConnect
          </ThemedText>
          <View style={styles.headerActions}>
            {isAdmin && (
              <Pressable
                style={styles.iconBtn}
                onPress={() => router.push('/(tabs)/admin')}
              >
                <ThemedIcon name="shield-check-outline" size={24} />
              </Pressable>
            )}
            <Pressable
              style={styles.iconBtn}
              onPress={() => (token ? router.push('/notifications') : router.push('/login'))}
            >
              <ThemedIcon name="bell-outline" size={24} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Services or Requests"
          onSubmit={() => router.push({ pathname: '/search/results', params: { q: searchQuery.trim() } })}
          containerStyle={{ marginHorizontal: horizontalPadding.paddingLeft }}
        />

        {/* Filters */}
        <HomeFilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.discoveryTip, horizontalPadding]}>
          {activeFilter === 'All'
            ? 'Browse Services for professional help or Requests to find students who need your skills.'
            : activeFilter === 'Services'
            ? 'Services are students offering professional help. Hire them to get your tasks done.'
            : 'Requests are from students who need help. Apply to these to earn and build your portfolio.'}
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
        {activeFilter === 'All' ? (
          <>
            {/* Section 1: Popular Services (Horizontal Subcategories) */}
            <SectionHeader
              title="Popular Services"
              horizontalPadding={horizontalPadding}
              onSeeAll={() => router.push({ pathname: '/search', params: { tab: 'categories' } })}
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
              {popularSubcategories.map((item, index) => (
                <PopularCategoryCard
                  key={`cat-${index}`}
                  title={item.title}
                  icon={item.icon}
                  colors={item.colors}
                  width={categoryCardWidth}
                  onPress={() => router.push({ 
                    pathname: '/search/listings/[subcategory]', 
                    params: { 
                        subcategory: item.title,
                        category: item.categoryId
                    } 
                  })}
                />
              ))}
            </ScrollView>

            {/* Section 2: Recently Viewed (Horizontal scrolling, 3 posts) */}
            {recentlyViewed.length > 0 && (
              <>
                <SectionHeader
                  title="Recently Viewed"
                  horizontalPadding={horizontalPadding}
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
                  {recentlyViewed.map((item) => (
                    <ListingCard
                      key={`recent-${item.id}`}
                      listing={item}
                      width={cardWidth}
                      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Promo Banner */}
            <Pressable 
              style={[
                styles.promoBanner, 
                { marginHorizontal: horizontalPadding.paddingLeft }
              ]}
              onPress={() => router.push({ pathname: '/search', params: { tab: 'categories' } })}
            >
              <Image 
                source={require('@/assets/images/promo-banner.png')} 
                style={styles.promoImage} 
                resizeMode="cover"
              />
              <View style={styles.promoContent}>
                <ThemedText variant="headlineSmall" style={styles.promoTitle} darkColor="#fff" lightColor="#fff">
                  Discover Campus Talent
                </ThemedText>
                <ThemedText variant="bodyLarge" style={styles.promoSubtitle} darkColor="rgba(255,255,255,0.95)" lightColor="rgba(255,255,255,0.95)">
                  Explore services and requests from your peers today.
                </ThemedText>
              </View>
            </Pressable>

            {/* Section 3: Featured Posts */}
            <View style={styles.featuredSection}>
              <View style={styles.featuredMainHeader}>
                <View style={[styles.headerLine, { backgroundColor: theme.outlineVariant }]} />
                <ThemedText variant="headlineSmall" style={styles.featuredTitle}>
                  Featured Posts
                </ThemedText>
                <View style={[styles.headerLine, { backgroundColor: theme.outlineVariant }]} />
              </View>
              
              {/* Subsection 3.1: Services (Horizontal) */}
              <SectionHeader
                title="Services"
                horizontalPadding={horizontalPadding}
                onSeeAll={() => setActiveFilter('Services')}
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
                {featuredServices.map((item) => (
                  <ListingCard
                    key={`service-${item.id}`}
                    listing={item}
                    width={cardWidth}
                    onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
                  />
                ))}
              </ScrollView>

              {/* Subsection 3.2: Requests (Horizontal) */}
              <SectionHeader
                title="Requests"
                horizontalPadding={horizontalPadding}
                onSeeAll={() => setActiveFilter('Requests')}
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
                {featuredRequests.map((item) => (
                  <RequestCard
                    key={`request-${item.id}`}
                    listing={item}
                    width={cardWidth}
                    onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={[{ paddingTop: Spacing.lg, gap: Spacing.md }, horizontalPadding]}>
            <ThemedText variant="titleLarge" style={{ fontWeight: '800', marginBottom: Spacing.sm }}>
              {activeFilter === 'Services' ? 'Available Services' : 'Open Requests'}
            </ThemedText>
            {(activeFilter === 'Services' ? featuredServices : featuredRequests).map((item) => {
              const CardComponent = activeFilter === 'Requests' ? RequestCard : ListingCard;
              return (
                <CardComponent
                  key={`list-${item.id}`}
                  listing={item}
                  onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
                />
              );
            })}
          </View>
        )}
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
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandLogo: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center', 
  },
  pillsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
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
  featuredSection: {
    marginTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  featuredMainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  featuredTitle: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 16,
    opacity: 0.8,
  },
  headerLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  featuredFeed: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  promoBanner: {
    marginTop: Spacing.xxl,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  promoContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.4)', 
  },
  promoTitle: {
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  promoSubtitle: {
    maxWidth: '90%',
    lineHeight: 22,
  },
});
