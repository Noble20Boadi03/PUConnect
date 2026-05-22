import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { CategoryDetailView } from '../../components/CategoryDetail';
import {
  buildExploreServiceHref,
  getExploreCategoryById,
  getExploreCategoryServices,
  getSafeAreaBottom,
  getScreenTopPadding,
} from '../../lib';
import type { ExploreCategoryService } from '../../types/explore';
import { useAppRouter } from '../../hooks';
import { Spacing, Typography } from '../../constants';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const insets = useSafeAreaInsets();
  const topPadding = getScreenTopPadding(insets.top);

  const category = getExploreCategoryById(id);
  const services = category ? getExploreCategoryServices(category.id) : [];

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
