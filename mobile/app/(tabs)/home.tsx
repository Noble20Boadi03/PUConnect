import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, RefreshControl, ScrollView, Pressable, TextInput, BackHandler, ToastAndroid, Platform } from 'react-native';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { ServiceCard } from '@/components/service-card';
import { router, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/use-responsive';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  horizontalPadding: number;
}

const SectionHeader = ({ title, onSeeAll, horizontalPadding }: SectionHeaderProps) => {
  return (
    <View style={[styles.sectionHeader, { paddingHorizontal: horizontalPadding }]}>
      <ThemedText variant="titleLarge" style={styles.sectionTitle}>{title}</ThemedText>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <ThemedText variant="labelLarge" colorName="primary">See All</ThemedText>
        </Pressable>
      )}
    </View>
  );
};

const PromotionBanner = ({ horizontalPadding }: { horizontalPadding: number }) => {
  const { theme } = useTheme();
  return (
    <View style={{ paddingHorizontal: horizontalPadding, marginVertical: Spacing.xl }}>
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
          <Pressable style={[styles.promoBtn, { backgroundColor: theme.background }]}>
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
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isTablet, spacingMultiplier } = useResponsive();
  
  const horizontalPadding = Spacing.xl * spacingMultiplier;

  const [popular, setPopular] = useState<Listing[]>([]);
  const [recommended, setRecommended] = useState<Listing[]>([]);
  const [recent, setRecent] = useState<Listing[]>([]);
  const [trending, setTrending] = useState<Listing[]>([]);
  const [lastOrderRecs, setLastOrderRecs] = useState<Listing[]>([]);
  const lastBackPress = useRef(0);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshTimestamp = useRef(0);

  // Implement Double Back to Exit for Android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const currentTime = Date.now();
        if (currentTime - lastBackPress.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPress.current = currentTime;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  const fetchDashboardData = async (signal?: AbortSignal) => {
    try {
      const data = await api.getListings(0, 10, undefined, signal);
      setPopular(data.slice(0, 5));
      setRecommended(data.slice(2, 7));
      setTrending(data.slice(5, 10));
      setRecent(data.slice(1, 4));
      setLastOrderRecs(data.slice(4, 9));
    } catch (error: any) {
      if (error.message === 'Aborted') return;
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      const now = Date.now();
      const throttleMs = 5 * 60 * 1000; // 5 minutes

      if (now - lastRefreshTimestamp.current > throttleMs) {
        fetchDashboardData(controller.signal);
        lastRefreshTimestamp.current = now;
      }

      return () => controller.abort();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      {/* Fixed Sticky Header */}
      <ThemedView 
        style={[
          styles.fixedHeader, 
          { paddingTop: insets.top + Spacing.sm, paddingHorizontal: horizontalPadding }
        ]}
      >
        <View style={styles.topRow}>
          <ThemedText variant="headlineSmall" style={styles.brandLogo}>
            PuConnect<ThemedText colorName="primary">.</ThemedText>
          </ThemedText>
          <Pressable style={styles.gridBtn}>
            <ThemedIcon name="apps" size={24} />
          </Pressable>
        </View>

        {/* Search Bar Row */}
        <ThemedView 
          colorName="surfaceVariant" 
          style={[styles.searchContainer, { borderColor: theme.outlineVariant }]}
        >
          <ThemedIcon name="magnify" size={20} colorName="textMuted" />
          <TextInput
            placeholder="Search services"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </ThemedView>
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + Spacing.massive }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Popular Services Section */}
        <SectionHeader title="Popular Services" horizontalPadding={horizontalPadding} onSeeAll={() => {}} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding - Spacing.md }}
          style={styles.horizontalSection}
        >
          {popular.map((item) => (
            <ServiceCard 
              key={`popular-${item.id}`} 
              listing={item} 
              width={isTablet ? 220 : 160}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Recommended For You Section */}
        <SectionHeader title="Recommended for you" horizontalPadding={horizontalPadding} onSeeAll={() => {}} />
        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.sectionSub, { paddingHorizontal: horizontalPadding }]}>
          Personalized based on your interests
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding - Spacing.md }}
          style={styles.horizontalSection}
        >
          {recommended.map((item) => (
            <ServiceCard 
              key={`rec-${item.id}`} 
              listing={item} 
              width={isTablet ? 220 : 160}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Promotion Banner */}
        <PromotionBanner horizontalPadding={horizontalPadding} />

        {/* Recently Viewed Section */}
        <SectionHeader title="Recently viewed" horizontalPadding={horizontalPadding} onSeeAll={() => {}} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding - Spacing.md }}
          style={styles.horizontalSection}
        >
          {recent.map((item) => (
            <ServiceCard 
              key={`recent-${item.id}`} 
              listing={item} 
              width={isTablet ? 220 : 160}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Based on Last Order Section */}
        <SectionHeader title="Based on your last order" horizontalPadding={horizontalPadding} onSeeAll={() => {}} />
        <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.sectionSub, { paddingHorizontal: horizontalPadding }]}>
          You hired a designer, you might also need...
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding - Spacing.md }}
          style={styles.horizontalSection}
        >
          {lastOrderRecs.map((item) => (
            <ServiceCard 
              key={`last-${item.id}`} 
              listing={item} 
              width={isTablet ? 220 : 160}
              onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })} 
            />
          ))}
        </ScrollView>

        {/* Trending This Week Section */}
        <SectionHeader title="Trending this week" horizontalPadding={horizontalPadding} onSeeAll={() => {}} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding - Spacing.md }}
          style={styles.horizontalSection}
        >
          {trending.map((item) => (
            <ServiceCard 
              key={`trend-${item.id}`} 
              listing={item} 
              width={isTablet ? 220 : 160}
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

