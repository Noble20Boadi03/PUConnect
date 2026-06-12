import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { CategoryDetailView, CategoryDetailViewSkeleton } from '../../components/CategoryDetail';
import {
  buildExploreServiceHref,
  getSafeAreaBottom,
  getScreenTopPadding,
} from '../../lib';
import type { ExploreCategory, ExploreCategoryService } from '../../types/explore';
import type { DbCategory, DbCategoryService } from '../../types';
import { useAppRouter } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { exploreService } from '../../services';

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

const mapDbCategoryServiceToExploreCategoryService = (dbService: DbCategoryService): ExploreCategoryService => ({
  id: dbService.id,
  categoryId: dbService.categoryId,
  title: dbService.title,
  description: dbService.description,
  filterTags: dbService.filterTags,
});

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const insets = useSafeAreaInsets();
  const topPadding = getScreenTopPadding(insets.top);

  const [category, setCategory] = useState<ExploreCategory | undefined>();
  const [services, setServices] = useState<ExploreCategoryService[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore' as any);
    }
  }, [router]);

  const handleServicePress = useCallback(
    (service: ExploreCategoryService) => {
      if (!category) return;
      router.pushStack(buildExploreServiceHref(category.id, service.id));
    },
    [category, router]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [categoryData, servicesData] = await Promise.all([
          exploreService.getCategoryById(id),
          exploreService.getCategoryServices(),
        ]);

        const mappedCategory = mapDbCategoryToExploreCategory(categoryData);
        const mappedServices = servicesData
          .filter(s => s.categoryId === id)
          .map(mapDbCategoryServiceToExploreCategoryService);

        setCategory(mappedCategory);
        setServices(mappedServices);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <CategoryDetailViewSkeleton />;
  }

  if (!category) {
    return (
      <View
        style={[
          styles.fallback,
          {
            backgroundColor: screenBg,
            paddingTop: topPadding,
            paddingBottom: getSafeAreaBottom(insets.bottom),
          },
        ]}
      >
        <TouchableOpacity style={styles.fallbackBack} onPress={handleBack}>
          <Ionicons name="chevron-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.fallbackText, { color: textColor }]}>Category not found</Text>
      </View>
    );
  }

  return (
    <CategoryDetailView
      category={category}
      services={services}
      onBack={handleBack}
      onServicePress={handleServicePress}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  fallbackBack: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  fallbackText: {
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
});
