import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ExploreServiceProvidersPanel } from '../../../../components/Explore/ExploreServiceProvidersPanel';
import { EXPLORE_PROVIDERS_MOCK } from '../../../../constants/exploreMock';
import {
  buildProviderProfileHref,
  getExploreCategoryServiceById,
  getSafeAreaBottom,
  getScreenTopPadding,
} from '../../../../lib';
import { useAppRouter, useThemeColor } from '../../../../hooks';
import { GuardedPressable } from '../../../../components/GuardedPressable';
import { Spacing, Typography } from '../../../../constants';
import type { ExploreProvider, ExploreServiceTagFilter } from '../../../../types/explore';

export default function CategoryServiceProvidersScreen() {
  const { id, serviceId } = useLocalSearchParams<{ id: string; serviceId: string }>();
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const borderColor = isDark ? '#30363D' : 'rgba(0, 0, 0, 0.08)';
  const insets = useSafeAreaInsets();
  const topPadding = getScreenTopPadding(insets.top);

  const service = getExploreCategoryServiceById(id, serviceId);
  const [activeTagFilter, setActiveTagFilter] = useState<ExploreServiceTagFilter>('all');

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else if (id) {
      router.replace({
        pathname: '/category/[id]',
        params: { id },
      });
    } else {
      router.replace('/(tabs)/explore' as any);
    }
  }, [router, id]);

  const handleProviderPress = useCallback(
    (provider: ExploreProvider) => {
      router.push(buildProviderProfileHref(provider.username) as any);
    },
    [router]
  );

  if (!service) {
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
        <GuardedPressable style={styles.fallbackBack} onPress={handleBack}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </GuardedPressable>
        <Text style={[styles.fallbackText, { color: Colors.text }]}>Service not found</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: screenBg,
          paddingTop: topPadding,
          paddingBottom: getSafeAreaBottom(insets.bottom),
        },
      ]}
    >
      <View style={styles.header}>
        <GuardedPressable
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </GuardedPressable>
        <Text style={[styles.headerTitle, { color: Colors.text }]} numberOfLines={2}>
          {service.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ExploreServiceProvidersPanel
        service={service}
        providers={EXPLORE_PROVIDERS_MOCK}
        activeTagFilter={activeTagFilter}
        onTagFilterChange={setActiveTagFilter}
        cardBg={cardBg}
        textColor={Colors.text}
        mutedColor={Colors.icon}
        primaryColor={Colors.primary}
        borderColor={borderColor}
        onProviderPress={handleProviderPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
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
