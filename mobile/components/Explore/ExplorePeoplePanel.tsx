import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControlProps } from 'react-native';
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

const CARD_GAP = 6;

export interface ExplorePeoplePanelProps {
  categories: ExploreCategory[];
  providers: ExploreProvider[];
  activeFilter: ExploreCategoryFilter;
  onFilterChange: (filter: ExploreCategoryFilter) => void;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  borderColor: string;
  onProviderPress: (provider: ExploreProvider) => void;
  searchQuery?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ExplorePeoplePanel: React.FC<ExplorePeoplePanelProps> = ({
  categories,
  providers,
  activeFilter,
  onFilterChange,
  cardBg,
  textColor,
  mutedColor,
  primaryColor,
  borderColor,
  onProviderPress,
  searchQuery = '',
  refreshControl,
}) => {
  const filtered = useMemo(
    () => filterExploreProviders(providers, activeFilter, searchQuery),
    [providers, activeFilter, searchQuery]
  );

  const emptyMessage = useMemo(() => {
    if (searchQuery) return 'No providers match your search.';
    if (activeFilter === 'all') return 'No providers to show right now.';
    const cat = categories.find((c) => c.id === activeFilter);
    return cat
      ? `No providers in ${cat.title} yet.`
      : 'No providers match this filter.';
  }, [activeFilter, categories, searchQuery]);

  const handleProviderPress = useCallback(
    (provider: ExploreProvider) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onProviderPress(provider);
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
        refreshControl={refreshControl}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: mutedColor }]}>{emptyMessage}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((provider) => (
              <ExploreProviderCard
                key={provider.username}
                provider={provider}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
                onPress={handleProviderPress}
              />
            ))}
          </View>
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
    paddingBottom: 120,
  },
  list: {
    gap: CARD_GAP,
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
