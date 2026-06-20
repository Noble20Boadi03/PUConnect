import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Typography } from '../../constants';
import {
  filterExploreProvidersByServiceTag,
  getExploreProvidersForService,
} from '../../lib/filterExploreProvidersByService';
import { formatExploreTagLabel } from '../../lib/formatExploreTagLabel';
import { ExploreTagFilterPills } from './ExploreTagFilterPills';
import { ExploreProviderCard } from './ExploreProviderCard';
import type {
  ExploreCategoryService,
  ExploreProvider,
  ExploreServiceTagFilter,
} from '../../types/explore';

const CARD_GAP = 6;

export interface ExploreServiceProvidersPanelProps {
  service: ExploreCategoryService;
  providers: ExploreProvider[];
  activeTagFilter: ExploreServiceTagFilter;
  onTagFilterChange: (filter: ExploreServiceTagFilter) => void;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  borderColor: string;
  subtleBg: string;
  onProviderPress: (provider: ExploreProvider) => void;
}

export const ExploreServiceProvidersPanel: React.FC<ExploreServiceProvidersPanelProps> = ({
  service,
  providers,
  activeTagFilter,
  onTagFilterChange,
  cardBg,
  textColor,
  mutedColor,
  primaryColor,
  borderColor,
  subtleBg,
  onProviderPress,
}) => {
  const insets = useSafeAreaInsets();
  const serviceProviders = useMemo(
    () => getExploreProvidersForService(providers, service),
    [providers, service]
  );

  const filtered = useMemo(
    () => filterExploreProvidersByServiceTag(serviceProviders, activeTagFilter),
    [serviceProviders, activeTagFilter]
  );

  const emptyMessage = useMemo(() => {
    if (activeTagFilter === 'all') {
      return `No providers for ${service.title} yet.`;
    }
    return `No providers match "${formatExploreTagLabel(activeTagFilter)}".`;
  }, [activeTagFilter, service.title]);

  const handleProviderPress = useCallback(
    (provider: ExploreProvider) => {
      
      onProviderPress(provider);
    },
    [onProviderPress]
  );

  return (
    <View style={styles.root}>
      <ExploreTagFilterPills
        tags={service.filterTags}
        activeFilter={activeTagFilter}
        onFilterChange={onTagFilterChange}
        textColor={textColor}
        primaryColor={primaryColor}
        borderColor={borderColor}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xxl + insets.bottom }]}
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
                primaryColor={primaryColor}
                subtleBg={subtleBg}
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

export default ExploreServiceProvidersPanel;
