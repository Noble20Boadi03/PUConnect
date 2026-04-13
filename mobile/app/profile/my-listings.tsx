import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAppAlert } from '@/context/alert-context';
import { useResponsive } from '@/hooks/use-responsive';

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { token, user } = useAuth();
  const { showAlert } = useAppAlert();
  const { contentPaddingLeft, contentPaddingRight } = useResponsive();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

  const params = useLocalSearchParams<{ tab?: string }>();
  const tabParam = typeof params.tab === 'string' ? params.tab : params.tab?.[0];
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'requests' | 'offers'>('all');

  useEffect(() => {
    if (tabParam === 'requests') setFilter('requests');
    else if (tabParam === 'offers') setFilter('offers');
    else if (tabParam === 'all') setFilter('all');
  }, [tabParam]);

  const filtered = useMemo(() => {
    if (filter === 'requests') return listings.filter((l) => l.type === 'service_request');
    if (filter === 'offers') return listings.filter((l) => l.type === 'service_offer');
    return listings;
  }, [listings, filter]);

  const load = useCallback(async () => {
    if (!user?.id || !token) {
      setListings([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getListingsByOwner(user.id);
      setListings(data.filter((l) => l.isActive));
    } catch {
      showAlert({ title: 'Error', subtitle: 'Could not load your listings.', severity: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const confirmDelete = (item: Listing) => {
    showAlert({
      title: 'Remove listing',
      subtitle: 'This will hide your post from the marketplace.',
      severity: 'warning',
      primaryButtonTitle: 'Remove',
      onPrimaryPress: async () => {
        if (!token) return;
        try {
          await api.deleteListing(item.id, token);
          load();
        } catch (e: any) {
          // A tiny timeout avoids state collisions with two modals stacking concurrently instantly
          setTimeout(() => {
              showAlert({ title: 'Error', subtitle: e?.message ?? 'Could not remove listing.', severity: 'error' });
          }, 500);
        }
      },
      secondaryButtonTitle: 'Cancel'
    });
  };

  if (!token) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ThemedText variant="bodyLarge" colorName="textSecondary">
            Sign in to manage your listings.
          </ThemedText>
          <Pressable onPress={() => router.push('/login')} style={{ marginTop: Spacing.lg }}>
            <ThemedText variant="labelLarge" colorName="primary">
              Sign in
            </ThemedText>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ThemedIcon name="chevron-left" size={28} />
        </Pressable>
        <ThemedText variant="headlineSmall" style={styles.headerTitle}>
          My listings
        </ThemedText>
        <Pressable onPress={() => router.push('/listing/create')} style={styles.addBtn}>
          <ThemedIcon name="plus" size={24} colorName="primary" />
        </Pressable>
      </ThemedView>

      <View style={[styles.tabRow, horizontalPadding]}>
        {(['all', 'requests', 'offers'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[
              styles.tabChip,
              {
                backgroundColor: filter === key ? theme.primaryContainer : theme.surfaceVariant,
                borderColor: filter === key ? theme.primary : theme.outlineVariant,
              },
            ]}
          >
            <ThemedText variant="labelLarge" colorName={filter === key ? 'primary' : 'textSecondary'}>
              {key === 'all' ? 'All' : key === 'requests' ? 'Requests' : 'Offers'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={[
          styles.list,
          horizontalPadding,
          { paddingBottom: insets.bottom + Spacing.xl },
          filtered.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedIcon name="briefcase-outline" size={48} colorName="outline" />
            <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={{ marginTop: Spacing.md }}>
              {listings.length === 0
                ? 'You have no active listings yet.'
                : filter === 'requests'
                  ? 'No request listings in this tab.'
                  : 'No service offers in this tab.'}
            </ThemedText>
            <Pressable onPress={() => router.push('/listing/create')} style={{ marginTop: Spacing.lg }}>
              <ThemedText variant="labelLarge" colorName="primary">
                Create a listing
              </ThemedText>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <ThemedView
            colorName="surfaceVariant"
            style={[styles.card, { borderColor: theme.outlineVariant }]}
          >
            <Pressable onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}>
              <ThemedText variant="titleMedium" numberOfLines={2}>
                {item.title}
              </ThemedText>
              <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginTop: 4 }}>
                {item.type === 'service_request' ? 'Request' : 'Offer'} · {item.category}
              </ThemedText>
              <ThemedText variant="titleSmall" colorName="primary" style={{ marginTop: Spacing.sm }}>
                ${item.price ?? item.budget ?? '—'}
              </ThemedText>
            </Pressable>
            <View style={styles.actions}>
              <Pressable
                onPress={() => router.push({ pathname: '/listing/create', params: { editId: item.id } })}
                style={styles.actionBtn}
              >
                <ThemedIcon name="pencil-outline" size={20} colorName="primary" />
                <ThemedText variant="labelLarge" colorName="primary">
                  Edit
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={styles.actionBtn}>
                <ThemedIcon name="trash-can-outline" size={20} colorName="error" />
                <ThemedText variant="labelLarge" colorName="error">
                  Remove
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontWeight: '800', flex: 1, textAlign: 'center' },
  addBtn: { padding: Spacing.xs, width: 40, alignItems: 'flex-end' },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  tabChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  list: { paddingTop: Spacing.md, gap: Spacing.md },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl * 2 },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
