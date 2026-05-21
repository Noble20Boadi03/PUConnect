import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { filterExploreProviders } from '../../lib/filterExploreProviders';
import { ExploreCategoryFilterPills } from './ExploreCategoryFilterPills';
import { ExploreProviderCard } from './ExploreProviderCard';
import type {
  ExploreCategory,
  ExploreCategoryFilter,
  ExploreProvider,
} from '../../types/explore';

export interface ExplorePeoplePanelProps {
  categories: ExploreCategory[];
  providers: ExploreProvider[];
  activeFilter: ExploreCategoryFilter;
  onFilterChange: (filter: ExploreCategoryFilter) => void;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  borderColor: string;
  onProviderPress?: (provider: ExploreProvider) => void;
}

export const ExplorePeoplePanel: React.FC<ExplorePeoplePanelProps> = ({
  categories,
  providers,
  activeFilter,
  onFilterChange,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  borderColor,
  onProviderPress,
}) => {
  const filtered = useMemo(
    () => filterExploreProviders(providers, activeFilter),
    [providers, activeFilter]
  );

  const categoryAccentById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.accentColor));
    return map;
  }, [categories]);

  const emptyMessage = useMemo(() => {
    if (activeFilter === 'all') return 'No providers to show right now.';
    const cat = categories.find((c) => c.id === activeFilter);
    return cat
      ? `No providers in ${cat.title} yet.`
      : 'No providers match this filter.';
  }, [activeFilter, categories]);

  const handleProviderPress = useCallback(
    (provider: ExploreProvider) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onProviderPress?.(provider);
    },
    [onProviderPress]
  );

  return (
    <View style={styles.root}>
      <ExploreCategoryFilterPills
        categories={categories}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        textColor={textColor}
        primaryColor={primaryColor}
        borderColor={borderColor}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: mutedColor }]}>{emptyMessage}</Text>
          </View>
        ) : (
          filtered.map((provider, index) => (
            <ExploreProviderCard
              key={provider.username}
              provider={provider}
              cardBg={cardBg}
              subtleBg={subtleBg}
              textColor={textColor}
              mutedColor={mutedColor}
              primaryColor={primaryColor}
              accentColor={categoryAccentById.get(provider.categoryId) ?? primaryColor}
              isLast={index === filtered.length - 1}
              onPress={onProviderPress ? handleProviderPress : undefined}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExplorePeoplePanel;
