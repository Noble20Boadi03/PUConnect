import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, useColorScheme, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ExploreView,
  ExploreHeader,
  ExploreTopTabs,
  ExploreCategoryCardSkeleton,
  ExploreProviderCardSkeleton,
} from '../../components';
import { exploreService } from '../../services';
import type { ExploreCategory, ExploreProvider, ExploreTab } from '../../types';
import type { DbCategory, User } from '../../types';
import { Spacing } from '../../constants';
import { getServiceOptionsByIds } from '../../lib';

// Mapping functions
const mapDbCategoryToExploreCategory = (dbCategory: DbCategory): ExploreCategory => ({
  id: dbCategory.id,
  title: dbCategory.title,
  pillLabel: dbCategory.pillLabel,
  tagline: dbCategory.tagline,
  description: dbCategory.description,
  imageUrl: dbCategory.imageUrl,
  accentColor: dbCategory.accentColor,
  iconName: dbCategory.iconName as any,
});

const mapUserToExploreProvider = (user: any): ExploreProvider => {
  // Build a skill title from the provider's actual services
  let services: Array<{ title: string }> = user.services ?? [];
  if (services.length === 0 && user.serviceIds && user.serviceIds.length > 0) {
    services = getServiceOptionsByIds(user.serviceIds);
  }
  const serviceNames = services.map((s) => s.title).join(', ');
  const skillTitle =
    serviceNames ||
    (user as any).skillTitle ||
    'Provider';

  return {
    username: user.username,
    displayName: user.name,
    handle: user.username,
    avatarUrl: user.avatarUrl,
    categoryId: (user as any).categoryId || 'tutoring',
    skillTitle,
    expertiseTags: (user as any).expertiseTags || [],
    serviceIds: (user as any).serviceIds || [],
    averageRating: 0,
    reviewCount: 0,
  };
};

export default function ExploreScreen() {
  const [categories, setCategories] = useState<ExploreCategory[]>([]);
  const [providers, setProviders] = useState<ExploreProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ExploreTab>('categories');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [categoriesData, providersData] = await Promise.all([
        exploreService.getCategories(),
        exploreService.getExploreProviders(),
      ]);

      setCategories(categoriesData.map(mapDbCategoryToExploreCategory));
      setProviders(providersData.map(mapUserToExploreProvider));
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
        <ExploreHeader textColor={isDark ? '#ECEDEE' : '#11181C'} buttonBg={cardBg} />
        <View style={styles.topSection}>
          <ExploreTopTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            subtleBg={subtleBg}
            cardBg={cardBg}
            textColor={isDark ? '#ECEDEE' : '#11181C'}
          />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.list}>
            {activeTab === 'categories' ? (
              Array.from({ length: 4 }).map((_, index) => (
                <ExploreCategoryCardSkeleton key={index} />
              ))
            ) : (
              Array.from({ length: 6 }).map((_, index) => (
                <ExploreProviderCardSkeleton key={index} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <ExploreView
      categories={categories}
      providers={providers}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    marginBottom: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  list: {
    gap: Spacing.sm + 4,
  },
});

