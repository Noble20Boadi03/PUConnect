import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, RefreshControl, ScrollView, Pressable, TextInput, Alert } from 'react-native';
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
import { ServiceCard } from '@/components/service-card';
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

const PromotionBanner = ({ horizontalPadding }: { horizontalPadding: { paddingLeft: number; paddingRight: number } }) => {
  const { theme } = useTheme();
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
              Alert.alert('Invite friends', 'Referral rewards will be available in a future update.', [{ text: 'OK' }])
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
  const { uiState, onRefresh } = useHomeViewModel();
  const { token, user } = useAuth();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const { isTablet, isLandscape, spacingMultiplier, contentPaddingLeft, contentPaddingRight } = useResponsive();
  const tabBarHeight = useTabBarHeight();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

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
          No listings available yet.
        </ThemedText>
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
          { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }
        ]}
      >
        <View style={styles.topRow}>
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
        <ThemedView 
          colorName="surfaceVariant" 
          style={[
            styles.searchContainer, 
            horizontalPadding,
            { borderColor: theme.outlineVariant }
          ]}
        >
          <ThemedIcon name="magnify" size={20} colorName="textMuted" />
          <TextInput
            placeholder="Search services"
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() =>
              router.push({ pathname: '/search/results', params: { q: searchQuery.trim() } })
            }
            style={[styles.searchInput, { color: theme.text }]}
          />
        </ThemedView>
        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.discoveryTip, horizontalPadding]}>
          {token && user?.canOfferServices
            ? 'Tip: Check the Requests tab to find students who need your skills.'
            : 'Tip: Browse Services for help; use the + menu to post a request when you need something done.'}
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
        {/* Popular Services Section */}
        <SectionHeader
          title="Popular Services"
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
            <ServiceCard 
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
          Personalized based on your interests
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {recommended.map((item) => (
            <ServiceCard 
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
            <ServiceCard 
              key={`recent-${item.id}`} 
              listing={item} 
              width={cardWidth}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Based on Last Order Section */}
        <SectionHeader
          title="Based on your last order"
          horizontalPadding={horizontalPadding}
          onSeeAll={() => router.push({ pathname: '/search/results', params: { q: '', section: 'lastOrder' } })}
        />
        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.sectionSub, horizontalPadding]}>
          You hired a designer, you might also need...
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {lastOrderRecs.map((item) => (
            <ServiceCard 
              key={`last-${item.id}`} 
              listing={item} 
              width={cardWidth}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
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
          contentContainerStyle={{ paddingLeft: horizontalPadding.paddingLeft, paddingRight: horizontalPadding.paddingRight - Spacing.md }}
          style={styles.horizontalSection}
        >
          {trending.map((item) => (
            <ServiceCard 
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  discoveryTip: {
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
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

