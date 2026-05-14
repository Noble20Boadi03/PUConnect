import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
      <ScreenHeader title="Profile" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <ThemedView style={[styles.hero, horizontalPadding, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
          {profile.profilePictureUrl ? (
            <Image
              source={{ uri: profile.profilePictureUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.primary + '18' }]}>
              <ThemedIcon name="account" size={40} colorName="primary" />
            </View>
          )}

          <ThemedText variant="headlineSmall" style={styles.name}>
            {profile.fullName}
          </ThemedText>
          <View style={styles.profileMetaRow}>
            {profile.verifiedStudent && (
              <View style={styles.badgeRow}>
                <ThemedIcon name="check-decagram" size={16} colorName="primary" />
                <ThemedText variant="labelSmall" colorName="primary">
                  Verified student
                </ThemedText>
              </View>
            )}
            {profile.username && (
              <ThemedText variant="labelSmall" colorName="primary" style={{ fontWeight: '700' }}>
                @{profile.username}
              </ThemedText>
            )}
          </View>
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
                <View key={tag} style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0' }]}>
                  <ThemedText variant="labelSmall">{tag}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </ThemedView>

        {/* Message Button */}
        {!isSelf ? (
          <View style={horizontalPadding}>
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
        ) : null}

        {/* Active Listings — Horizontal Scroll */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText variant="titleLarge" style={[styles.sectionTitle, { paddingLeft: horizontalPadding.paddingLeft }]}>
            Active listings
          </ThemedText>
        </View>
        {listings.length === 0 ? (
          <View style={[horizontalPadding, { paddingVertical: Spacing.md }]}>
            <ThemedText variant="bodyMedium" colorName="textMuted">
              No active listings yet.
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: horizontalPadding.paddingLeft,
              paddingRight: horizontalPadding.paddingRight,
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

        {/* Reviews Section */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText variant="titleLarge" style={[styles.sectionTitle, { paddingLeft: horizontalPadding.paddingLeft }]}>
            Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
          </ThemedText>
          {avgRating && (
            <View style={[styles.avgRatingBadge, { paddingRight: horizontalPadding.paddingRight }]}>
              <ThemedIcon name="star" size={16} lightColor="#fbbf24" darkColor="#fbbf24" />
              <ThemedText variant="labelLarge" style={{ fontWeight: '800' }}>{avgRating}</ThemedText>
            </View>
          )}
        </View>

        <View style={horizontalPadding}>
          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <ThemedIcon name="comment-text-outline" size={40} colorName="outline" />
              <ThemedText variant="bodyMedium" colorName="textMuted" style={{ marginTop: Spacing.sm }}>
                No reviews yet.
              </ThemedText>
            </View>
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}
              >
                {/* Reviewer header */}
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

                {/* Stars */}
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

                {/* Comment */}
                <ThemedText variant="bodyMedium" colorName="textSecondary" style={styles.reviewComment}>
                  {review.comment}
                </ThemedText>
              </View>
            ))
          )}
        </View>
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
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: { fontWeight: '800', textAlign: 'center' },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xs,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bio: { marginTop: Spacing.md, textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md, justifyContent: 'center' },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 6 },
  msgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontWeight: '700' },
  avgRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  reviewerInitial: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: Spacing.sm,
  },
  reviewComment: {
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
});
