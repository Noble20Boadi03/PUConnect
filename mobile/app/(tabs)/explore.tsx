import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, useColorScheme, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  ExploreView,
  ExploreHeader,
  ExploreTopTabs,
  ExploreCategoryCardSkeleton,
  ExploreProviderCardSkeleton,
} from '../../components';
import type { ExploreTab } from '../../types';
import { Spacing } from '../../constants';
import { useExploreStore } from '../../store/exploreStore';

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('categories');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const { categories, providers, isLoading, isRefreshing, error, fetchExploreData } = useExploreStore();

  const onRefresh = useCallback(() => {
    fetchExploreData(true);
  }, [fetchExploreData]);

  useFocusEffect(
    useCallback(() => {
      fetchExploreData();
    }, [fetchExploreData])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: screenBg }]}>
        <ExploreHeader textColor={isDark ? '#ECEDEE' : '#11181C'} buttonBg={cardBg}>
          <View style={styles.topSection}>
            <ExploreTopTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              subtleBg={subtleBg}
              cardBg={cardBg}
              textColor={isDark ? '#ECEDEE' : '#11181C'}
            />
          </View>
        </ExploreHeader>
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
      </View>
    );
  }

  return (
    <ExploreView
      categories={categories}
      providers={providers}
      error={error}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
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

