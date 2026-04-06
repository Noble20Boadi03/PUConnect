import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, ActivityIndicator, RefreshControl, ScrollView, Pressable, TextInput, Dimensions } from 'react-native';
import { api } from '@/services/api';
import { Listing, ListingType } from '@/types';
import { ServiceCard } from '@/components/service-card';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

const SectionHeader = ({ title, onSeeAll }: SectionHeaderProps) => {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
        </Pressable>
      )}
    </View>
  );
};

const PromotionBanner = () => {
  return (
    <LinearGradient
      colors={['#831843', '#4c0519']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.promoBanner}
    >
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>Invite friends & get rewards</Text>
        <Text style={styles.promoSub}>Spread the word and help your campus community build together.</Text>
        <Pressable style={styles.promoBtn}>
          <Text style={styles.promoBtnText}>Invite now →</Text>
        </Pressable>
      </View>
      <View style={styles.promoIcon}>
        <Ionicons name="gift-outline" size={60} color="rgba(255,255,255,0.2)" />
      </View>
    </LinearGradient>
  );
};

export default function HomeScreen() {
  const [popular, setPopular] = useState<Listing[]>([]);
  const [recommended, setRecommended] = useState<Listing[]>([]);
  const [recent, setRecent] = useState<Listing[]>([]);
  const [trending, setTrending] = useState<Listing[]>([]);
  const [lastOrderRecs, setLastOrderRecs] = useState<Listing[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { theme, isDark } = useTheme();

  const fetchDashboardData = async () => {
    try {
      const data = await api.getListings();
      // Logic to split the data into different mock categories for the UI
      setPopular(data.slice(0, 5));
      setRecommended(data.slice(2, 7));
      setTrending(data.slice(5, 10));
      setRecent(data.slice(1, 4));
      setLastOrderRecs(data.slice(4, 9));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Top Header Row (Logo and Grid) */}
        <View style={styles.topRow}>
          <Text style={[styles.brandLogo, { color: theme.text }]}>PuConnect<Text style={{ color: theme.primary }}>.</Text></Text>
          <Pressable style={styles.gridBtn}>
            <Ionicons name="grid-outline" size={24} color={theme.text} />
          </Pressable>
        </View>

        {/* Search Bar Row */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? theme.surface : '#f8fafc', borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={20} color={theme.textMuted} />
          <TextInput
            placeholder="Search services"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        {/* Popular Services Section */}
        <SectionHeader title="Popular Services" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSection}>
          {popular.map((item) => (
            <ServiceCard key={`popular-${item.id}`} listing={item} onPress={() => router.push(`/listing/${item.id}`)} />
          ))}
        </ScrollView>

        {/* Recommended For You Section */}
        <SectionHeader title="Recommended for you" onSeeAll={() => {}} />
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Personalized based on your interests</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSection}>
          {recommended.map((item) => (
            <ServiceCard key={`rec-${item.id}`} listing={item} onPress={() => router.push(`/listing/${item.id}`)} />
          ))}
        </ScrollView>

        {/* Promotion Banner */}
        <PromotionBanner />

        {/* Recently Viewed Section */}
        <SectionHeader title="Recently viewed" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSection}>
          {recent.map((item) => (
            <ServiceCard key={`recent-${item.id}`} listing={item} onPress={() => router.push(`/listing/${item.id}`)} />
          ))}
        </ScrollView>

        {/* Based on Last Order Section */}
        <SectionHeader title="Based on your last order" onSeeAll={() => {}} />
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>You hired a designer, you might also need...</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSection}>
          {lastOrderRecs.map((item) => (
            <ServiceCard key={`last-${item.id}`} listing={item} onPress={() => router.push(`/listing/${item.id}`)} />
          ))}
        </ScrollView>

        {/* Trending This Week Section */}
        <SectionHeader title="Trending this week" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSection}>
          {trending.map((item) => (
            <ServiceCard key={`trend-${item.id}`} listing={item} onPress={() => router.push(`/listing/${item.id}`)} />
          ))}
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  brandLogo: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  gridBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 52,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 13,
    paddingHorizontal: Spacing.lg,
    marginBottom: 8,
    marginTop: -4,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  horizontalSection: {
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  promoBanner: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    zIndex: 2,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  promoSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  promoBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    color: '#4c0519',
    fontWeight: '700',
    fontSize: 13,
  },
  promoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.8,
  },
});

