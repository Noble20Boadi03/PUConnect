import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, ActivityIndicator, RefreshControl, Image, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAppAlert } from '@/context/alert-context';
import { useResponsive } from '@/hooks/use-responsive';
import { ListingCard } from '@/components/listing-card';
import { RequestCard } from '@/components/request-card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { token, user } = useAuth();
  const { showAlert } = useAppAlert();
  const { horizontalPadding, isTablet, isLandscape } = useResponsive();

  const params = useLocalSearchParams<{ tab?: string }>();
  const tabParam = typeof params.tab === 'string' ? params.tab : params.tab?.[0];
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'requests' | 'offers'>('all');
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderScrolled(offsetY > 160);
  };

  const cardWidth = useMemo(() => {
    const padding = horizontalPadding.paddingLeft + horizontalPadding.paddingRight;
    if (isTablet) return (SCREEN_WIDTH - padding - Spacing.md) / 2;
    if (isLandscape) return (SCREEN_WIDTH - padding - Spacing.md * 2) / 3;
    return SCREEN_WIDTH - padding;
  }, [horizontalPadding, isTablet, isLandscape]);

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
  }, [user?.id, token, showAlert]);

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
          setTimeout(() => {
              showAlert({ title: 'Error', subtitle: e?.message ?? 'Could not remove listing.', severity: 'error' });
          }, 500);
        }
      },
      secondaryButtonTitle: 'Cancel'
    });
  };

  const renderHeader = () => (
    <View style={{ paddingTop: Spacing.sm }}>
      {/* ─── AVATAR + IDENTITY ──────────────────────── */}
      {user && (
        <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={isDark
                ? ['#c084fc', '#7c3aed', '#4c1d95'] as const
                : ['#e9d5ff', '#8b5cf6', '#5b21b6'] as const
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradientRing}
            >
              <View style={[styles.avatarInnerRing, { backgroundColor: theme.background }]}>
                {user.profilePictureUrl ? (
                  <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient
                    colors={isDark
                      ? ['#7c3aed', '#6d28d9'] as const
                      : ['#a78bfa', '#7c3aed'] as const
                    }
                    style={styles.avatarPlaceholder}
                  >
                    <ThemedText
                      variant="displaySmall"
                      lightColor="#fff"
                      darkColor="#fff"
                      style={{ fontWeight: '700', fontSize: 44 }}
                    >
                      {user.fullName?.charAt(0) || '?'}
                    </ThemedText>
                  </LinearGradient>
                )}
              </View>
            </LinearGradient>
          </View>

          <ThemedText variant="headlineSmall" style={styles.displayName}>
            {user.fullName}
          </ThemedText>
          <ThemedText variant="bodyMedium" colorName="primary" style={{ marginTop: 4, fontWeight: '600' }}>
            Verified Provider
          </ThemedText>
        </Animated.View>
      )}

      {/* ─── PROVIDER INFO CARD ──────────────────────────────── */}
      {user && (
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}
        >
          <View style={styles.infoCardInner}>
            {/* Username row */}
            <View style={styles.infoRowColumn}>
              <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.xs }}>
                Username
              </ThemedText>
              <ThemedText variant="bodyLarge" style={styles.infoValue}>
                @{user.username || 'username'}
              </ThemedText>
            </View>

            {user.bio && (
              <>
                <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />
                <View style={styles.infoRowColumn}>
                  <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.xs }}>
                    About Me
                  </ThemedText>
                  <ThemedText variant="bodyMedium" style={{ lineHeight: 22 }}>
                    {user.bio}
                  </ThemedText>
                </View>
              </>
            )}

            {user.skillTags && user.skillTags.length > 0 && (
              <>
                <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />
                <View style={styles.infoRowColumn}>
                  <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.sm }}>
                    Offered Services & Skills
                  </ThemedText>
                  <View style={styles.skillsContainer}>
                    {user.skillTags.map((skill, index) => (
                      <View key={index} style={[styles.skillChip, { backgroundColor: theme.primaryContainer }]}>
                        <ThemedText variant="labelMedium" colorName="onPrimaryContainer">{skill}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      )}

      {/* Tabs */}
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

      <View style={[horizontalPadding, { marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>
        <ThemedText variant="titleLarge" style={{ fontWeight: '800' }}>
          Active services
        </ThemedText>
      </View>
    </View>
  );

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
      <ScreenHeader
        title={isHeaderScrolled ? user?.fullName || "" : ""}
        right={
          <Pressable onPress={() => router.push('/listing/create')} style={styles.addBtn}>
            <ThemedIcon name="plus" size={24} colorName="primary" />
          </Pressable>
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xl },
          filtered.length === 0 && styles.emptyList,
        ]}
        columnWrapperStyle={isTablet || isLandscape ? { gap: Spacing.md, paddingHorizontal: horizontalPadding.paddingLeft } : undefined}
        numColumns={isTablet ? 2 : isLandscape ? 3 : 1}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.illustrationContainer, { backgroundColor: theme.primaryContainer + '20' }]}>
                <ThemedIcon name="briefcase-outline" size={64} colorName="primary" />
            </View>
            <ThemedText variant="titleLarge" style={{ marginTop: Spacing.xl, fontWeight: '800' }}>
                No active listings
            </ThemedText>
            <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={styles.emptyDescription}>
              {listings.length === 0
                ? 'You have no active listings yet. Start by offering a service or posting a request.'
                : filter === 'requests'
                  ? 'No request listings in this tab.'
                  : 'No service offers in this tab.'}
            </ThemedText>
            <PrimaryButton 
                title="Create a listing" 
                onPress={() => router.push('/listing/create')} 
                style={{ marginTop: Spacing.xl, width: '100%' }} 
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.cardContainer, { width: cardWidth, marginHorizontal: isTablet || isLandscape ? 0 : horizontalPadding.paddingLeft }]}>
            {item.type === 'service_offer' ? (
              <ListingCard 
                listing={item} 
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })} 
              />
            ) : (
              <RequestCard 
                listing={item} 
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })} 
              />
            )}
            
            {/* Management Actions Overlay/Row */}
            <View style={[styles.cardActions, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
              <Pressable
                onPress={() => router.push({ pathname: '/listing/create', params: { editId: item.id } })}
                style={styles.actionBtn}
              >
                <ThemedIcon name="pencil-outline" size={18} colorName="primary" />
                <ThemedText variant="labelMedium" colorName="primary">Edit</ThemedText>
              </Pressable>
              <View style={[styles.actionDivider, { backgroundColor: theme.outlineVariant }]} />
              <Pressable onPress={() => confirmDelete(item)} style={styles.actionBtn}>
                <ThemedIcon name="trash-can-outline" size={18} colorName="error" />
                <ThemedText variant="labelMedium" colorName="error">Remove</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  addBtn: { padding: Spacing.xs, width: 40, alignItems: 'flex-end' },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarWrapper: {
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  avatarGradientRing: {
    padding: 4,
    borderRadius: 999,
  },
  avatarInnerRing: {
    padding: 4,
    borderRadius: 999,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  infoCard: {
    marginHorizontal: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    ...Shadows.level1,
  },
  infoCardInner: {
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoRowColumn: {
    paddingVertical: Spacing.xs,
  },
  infoValue: {
    fontWeight: '700',
  },
  infoDivider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  tabChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  list: { paddingTop: Spacing.md },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { 
    alignItems: 'center', 
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDescription: {
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  
  cardContainer: {
    marginBottom: Spacing.xl,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: -Spacing.sm, // Slight overlap with card for tighter look
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: 8,
    justifyContent: 'space-around',
    ...Shadows.level1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
});
