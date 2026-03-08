import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, ActivityIndicator, RefreshControl, ScrollView, Pressable, TextInput } from 'react-native';
import { api } from '@/services/api';
import { Listing, ListingType } from '@/types';
import { ListingCard } from '@/components/listing-card';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORIES } from '@/constants/categories';

const TYPES: { label: string; value: ListingType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Offers', value: 'service_offer' },
  { label: 'Requests', value: 'service_request' },
  { label: 'Teams', value: 'project_team' },
];

export default function HomeScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const fetchListings = async () => {
    try {
      const data = await api.getListings();
      let filtered = data;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(l => l.category === selectedCategory);
      }
      if (selectedType !== 'all') {
        filtered = filtered.filter(l => l.type === selectedType);
      }
      setListings(filtered);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome to</Text>
          <Text style={[styles.brand, { color: theme.primary }]}>PuConnect</Text>
        </View>
        <Pressable style={[styles.notificationBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          <View style={[styles.badgeDot, { backgroundColor: theme.error }]} />
        </Pressable>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={20} color={theme.textMuted} />
        <TextInput
          placeholder="Search for skills, services, or teams..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {TYPES.map((type) => (
          <Pressable
            key={type.value}
            onPress={() => setSelectedType(type.value)}
            style={[
              styles.typeChip,
              { backgroundColor: selectedType === type.value ? theme.primary : theme.surface },
              selectedType !== type.value && { borderWidth: 1, borderColor: theme.border }
            ]}
          >
            <Text style={[
              styles.chipText,
              { color: selectedType === type.value ? '#fff' : theme.textSecondary }
            ]}>
              {type.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.value}
            onPress={() => setSelectedCategory(cat.value)}
            style={[
              styles.categoryChip,
              selectedCategory === cat.value && { borderBottomWidth: 2, borderBottomColor: theme.primary }
            ]}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === cat.value ? theme.primary : theme.textSecondary, fontWeight: selectedCategory === cat.value ? '700' : '500' }
            ]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={listings}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => console.log('Listing pressed:', item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No {selectedType !== 'all' ? selectedType.replace('_', ' ') : 'listings'} found in {selectedCategory}
            </Text>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  badgeDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 15,
  },
  filterScroll: {
    marginBottom: Spacing.md,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: Spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
    fontSize: 16,
  },
});
