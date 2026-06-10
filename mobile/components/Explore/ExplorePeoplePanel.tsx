import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  searchQuery,
  onSearchChange,
}) => {
  const filtered = useMemo(
    () => filterExploreProviders(providers, activeFilter, searchQuery),
    [providers, activeFilter, searchQuery]
  );

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
      onProviderPress(provider);
    },
    [onProviderPress]
  );

  return (
    <View style={styles.root}>
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search-outline" size={20} color={mutedColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search providers, skills..."
          placeholderTextColor={mutedColor}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color={mutedColor} />
          </TouchableOpacity>
        )}
      </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.sm + 4,
    height: 44,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm + 4,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    height: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
