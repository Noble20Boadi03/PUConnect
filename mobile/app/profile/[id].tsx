import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { User, Listing } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { ListingCard } from '@/components/listing-card';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user: me } = useAuth();
  const { horizontalPadding, isTablet, isLandscape } = useResponsive();
  const cardWidth = isTablet ? 240 : isLandscape ? 200 : 160;

  const [profile, setProfile] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const u = await api.getUserById(id as string);
      setProfile(u);
      const L = await api.getListingsByOwner(id as string);
      setListings(L.filter((l) => l.isActive));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!profile) {
    return (
      <ScreenLayout>
        <View style={[styles.centered, horizontalPadding]}>
          <ThemedText variant="titleMedium">Member not found</ThemedText>
          <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.lg }}>
            <ThemedText variant="labelLarge" colorName="primary">
              Go back
            </ThemedText>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  const isSelf = me?.id === profile.id;

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Profile" />

      <ScrollView
        contentContainerStyle={[styles.scroll, horizontalPadding, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary + '18' }]}>
            <ThemedIcon name="account" size={40} colorName="primary" />
          </View>
          <ThemedText variant="headlineSmall" style={styles.name}>
            {profile.fullName}
          </ThemedText>
          {profile.verifiedStudent && (
            <View style={styles.badgeRow}>
              <ThemedIcon name="check-decagram" size={16} colorName="primary" />
              <ThemedText variant="labelSmall" colorName="primary">
                Verified student
              </ThemedText>
            </View>
          )}
          <ThemedText variant="bodyMedium" colorName="textSecondary" align="center">
            {profile.department ?? 'Student'} · Class of {profile.graduationYear ?? '—'}
          </ThemedText>
          {profile.bio ? (
            <ThemedText variant="bodyMedium" colorName="textSecondary" style={styles.bio}>
              {profile.bio}
            </ThemedText>
          ) : null}
          {profile.skillTags && profile.skillTags.length > 0 ? (
            <View style={styles.tags}>
              {profile.skillTags.slice(0, 8).map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: theme.surfaceVariant }]}>
                  <ThemedText variant="labelSmall">{tag}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </ThemedView>

        {!isSelf ? (
          <Pressable
            style={[styles.msgBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: profile.id } })}
          >
            <ThemedIcon name="chat-processing" size={20} lightColor="#fff" darkColor="#fff" />
            <ThemedText variant="labelLarge" lightColor="#fff" darkColor="#fff">
              Message
            </ThemedText>
          </Pressable>
        ) : null}

        <ThemedText variant="titleLarge" style={styles.sectionTitle}>
          Active listings
        </ThemedText>
        {listings.length === 0 ? (
          <ThemedText variant="bodyMedium" colorName="textMuted">
            No active listings yet.
          </ThemedText>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.md, paddingVertical: Spacing.sm }}
          >
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                width={cardWidth}
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
              />
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scroll: { paddingTop: Spacing.sm },
  hero: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.level1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: { fontWeight: '800', textAlign: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  bio: { marginTop: Spacing.md, textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md, justifyContent: 'center' },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  msgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: { fontWeight: '700', marginTop: Spacing.xl, marginBottom: Spacing.sm },
});
