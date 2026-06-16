import React, { useCallback, useEffect } from 'react';
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
import { useAppRouter } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { useCategoryDetailStore } from '../../store';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const insets = useSafeAreaInsets();
  const topPadding = getScreenTopPadding(insets.top);

  const { data, isLoading, fetchCategoryDetail } = useCategoryDetailStore();
  const category = data?.category;
  const services = data?.services || [];

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
    if (id) {
      fetchCategoryDetail(id);
    }
  }, [id, fetchCategoryDetail]);

  if (isLoading) {
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
