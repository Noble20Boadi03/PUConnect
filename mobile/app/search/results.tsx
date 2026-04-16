import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { ListingCard } from '@/components/listing-card';
import { SearchBar } from '@/components/ui/search-bar';

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ q?: string; section?: string }>();
  const qParam = params.q;
  const initialQ = typeof qParam === 'string' ? qParam : Array.isArray(qParam) ? qParam[0] ?? '' : '';
  const section = typeof params.section === 'string' ? params.section : '';

  const { horizontalPadding, isTablet, isLandscape } = useResponsive();
  const cardWidth = isTablet ? 240 : isLandscape ? 200 : 160;

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await api.searchListings(query);
        if (!cancelled) setResults(data);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const onSubmit = () => {
    setLoading(true);
    api.searchListings(query).then((data) => {
      setResults(data);
      setLoading(false);
    });
  };

  const headerSubtitle =
    section === 'popular'
      ? 'Popular services'
      : section === 'recommended'
        ? 'Recommended for you'
        : section === 'recent'
          ? 'Recently viewed'
          : section === 'trending'
            ? 'Trending this week'
            : section === 'lastOrder'
              ? 'Based on your last order'
              : null;

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader 
        title={
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={onSubmit}
            placeholder="Search services"
          />
        }
      />

      {headerSubtitle ? (
        <ThemedText variant="labelLarge" colorName="textMuted" style={[horizontalPadding, { marginBottom: Spacing.sm }]}>
          {headerSubtitle}
        </ThemedText>
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                api.searchListings(query).then((data) => {
                  setResults(data);
                  setRefreshing(false);
                });
              }}
              tintColor={theme.primary}
            />
          }
          contentContainerStyle={[
            styles.list,
            horizontalPadding,
            { paddingBottom: insets.bottom + Spacing.xl },
            results.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ThemedIcon name="magnify" size={48} colorName="outline" />
              <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={{ marginTop: Spacing.md }}>
                No listings match your search.
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: Spacing.md, alignItems: 'center' }}>
              <ListingCard
                listing={item}
                width={Math.min(cardWidth * 1.4, 400)}
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
              />
            </View>
          )}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({


  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingTop: Spacing.sm },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl * 2 },
});
