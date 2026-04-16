import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { ListingCard } from '@/components/listing-card';

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ q?: string; section?: string }>();
  const qParam = params.q;
  const initialQ = typeof qParam === 'string' ? qParam : Array.isArray(qParam) ? qParam[0] ?? '' : '';
  const section = typeof params.section === 'string' ? params.section : '';

  const { contentPaddingLeft, contentPaddingRight, isTablet, isLandscape } = useResponsive();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };
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
      <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ThemedIcon name="chevron-left" size={28} />
        </Pressable>
        <ThemedView
          colorName="surfaceVariant"
          style={[styles.searchBox, { borderColor: theme.outlineVariant }]}
        >
          <ThemedIcon name="magnify" size={20} colorName="textMuted" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            placeholder="Search services"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </ThemedView>
      </ThemedView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingTop: Spacing.sm },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl * 2 },
});
