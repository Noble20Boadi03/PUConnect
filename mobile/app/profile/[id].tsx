import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { User, Listing, Review } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { ListingCard } from '@/components/listing-card';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user: me } = useAuth();
  const { horizontalPadding, isTablet, isLandscape } = useResponsive();
  const cardWidth = isTablet ? 240 : isLandscape ? 200 : 160;

  const [profile, setProfile] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewerNames, setReviewerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderScrolled(offsetY > 160); // Threshold where the name starts disappearing
  };

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const u = await api.getUserById(id as string);
      setProfile(u);
      const L = await api.getListingsByOwner(id as string);
      setListings(L.filter((l) => l.isActive));
      const R = await api.getReviewsByTargetUser(id as string);
      setReviews(R);

      // Resolve reviewer names
      const names: Record<string, string> = {};
      for (const r of R) {
        if (!names[r.authorUserId]) {
          const reviewer = await api.getUserById(r.authorUserId);
          names[r.authorUserId] = reviewer?.fullName ?? 'Anonymous';
        }
      }
      setReviewerNames(names);
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
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={isHeaderScrolled ? profile.fullName : ""} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        {/* ─── AVATAR + IDENTITY ──────────────────────── */}
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
                {profile.profilePictureUrl ? (
                  <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatarImage} />
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
                      {profile.fullName?.charAt(0) || '?'}
                    </ThemedText>
                  </LinearGradient>
                )}
              </View>
            </LinearGradient>
          </View>

          <ThemedText variant="headlineSmall" style={styles.displayName}>
            {profile.fullName}
          </ThemedText>
          <ThemedText variant="bodyMedium" colorName="primary" style={{ marginTop: 4, fontWeight: '600' }}>
            {profile.verifiedStudent ? "Verified Provider" : "Campus Member"}
          </ThemedText>
        </Animated.View>

        {/* ─── PROVIDER INFO CARD ──────────────────────────────── */}
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
                @{profile.username || 'username'}
              </ThemedText>
            </View>

            {profile.bio && (
              <>
                <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />
                <View style={styles.infoRowColumn}>
                  <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.xs }}>
                    About Me
                  </ThemedText>
                  <ThemedText variant="bodyMedium" style={{ lineHeight: 22 }}>
                    {profile.bio}
                  </ThemedText>
                </View>
              </>
            )}

            {profile.skillTags && profile.skillTags.length > 0 && (
              <>
                <View style={[styles.infoDivider, { backgroundColor: theme.outlineVariant }]} />
                <View style={styles.infoRowColumn}>
                  <ThemedText variant="bodySmall" colorName="textMuted" style={{ marginBottom: Spacing.sm }}>
                    Offered Services & Skills
                  </ThemedText>
                  <View style={styles.skillsContainer}>
                    {profile.skillTags.map((skill, index) => (
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

        {/* Message Button */}
        {!isSelf && (
          <View style={[horizontalPadding, { marginBottom: Spacing.xl }]}>
            <Pressable
              style={[styles.msgBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: profile.id } })}
            >
              <ThemedIcon name="chat-processing" size={20} lightColor="#fff" darkColor="#fff" />
              <ThemedText variant="labelLarge" lightColor="#fff" darkColor="#fff">
                Message
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* Active Listings / Skill Ads Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={horizontalPadding}>
          <ThemedText variant="titleLarge" style={styles.adsSectionTitle}>
            Active services
          </ThemedText>

          {listings.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surfaceVariant }]}>
              <ThemedIcon name="bullhorn-outline" size={48} colorName="textMuted" />
              <ThemedText variant="titleMedium" style={styles.emptyTitle}>
                No active ads
              </ThemedText>
              <ThemedText variant="bodyMedium" colorName="textMuted" align="center" style={styles.emptySubtitle}>
                This provider currently doesn&apos;t have any active skill ads posted.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: Spacing.md,
                paddingVertical: Spacing.sm,
              }}
            >
              {listings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  width={cardWidth}
                  onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id, fromProfile: 'true' } })}
                />
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={[horizontalPadding, { marginTop: Spacing.xl }]}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText variant="titleLarge" style={styles.adsSectionTitle}>
                Reviews ({reviews.length})
              </ThemedText>
              {avgRating && (
                <View style={styles.avgRatingBadge}>
                  <ThemedIcon name="star" size={16} lightColor="#fbbf24" darkColor="#fbbf24" />
                  <ThemedText variant="labelLarge" style={{ fontWeight: '800', marginLeft: 4 }}>{avgRating}</ThemedText>
                </View>
              )}
            </View>

            {reviews.map((review) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}
              >
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewerInitial, { backgroundColor: theme.primary + '18' }]}>
                    <ThemedText variant="labelLarge" colorName="primary" style={{ fontWeight: '800' }}>
                      {(reviewerNames[review.authorUserId] ?? 'A').charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="labelLarge" style={{ fontWeight: '700' }}>
                      {reviewerNames[review.authorUserId] ?? 'Anonymous'}
                    </ThemedText>
                    <ThemedText variant="labelSmall" colorName="textMuted">
                      {timeAgo(review.createdAt)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <ThemedIcon
                      key={s}
                      name={s <= review.rating ? 'star' : 'star-outline'}
                      size={16}
                      lightColor="#fbbf24"
                      darkColor="#fbbf24"
                    />
                  ))}
                </View>

                <ThemedText variant="bodyMedium" colorName="textSecondary" style={styles.reviewComment}>
                  {review.comment}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingTop: Spacing.sm },

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
  adsSectionTitle: {
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  emptyTitle: {
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    maxWidth: '80%',
  },

  msgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: BorderRadius.lg,
    ...Shadows.level2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avgRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  reviewerInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewComment: {
    lineHeight: 20,
  },
});
