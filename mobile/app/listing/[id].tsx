import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Pressable, View, Image, StatusBar } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useListingViewModel } from '@/hooks/view-models/use-listing-view-model';
import { useResponsive } from '@/hooks/use-responsive';
import { api } from '@/services/api';
import { User } from '@/types';

const IMAGE_HEIGHT = 320;

export default function ListingDetailsScreen() {
  const { id, fromChat, fromProfile } = useLocalSearchParams<{ id: string; fromChat?: string; fromProfile?: string }>();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { uiState } = useListingViewModel(id as string);
  const { contentPaddingLeft, contentPaddingRight } = useResponsive();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

  const [owner, setOwner] = useState<User | null>(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const THRESHOLD = IMAGE_HEIGHT - (insets.top + 24);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (uiState.status !== 'content') return;
      const oid = uiState.data.listing.ownerId;
      const u = await api.getUserById(oid);
      if (!cancelled) setOwner(u);
    })();
    return () => {
      cancelled = true;
    };
  }, [uiState]);

  const handleScroll = (e: any) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    if (scrollY > THRESHOLD && !isHeaderScrolled) {
      setIsHeaderScrolled(true);
    } else if (scrollY <= THRESHOLD && isHeaderScrolled) {
      setIsHeaderScrolled(false);
    }
  };

  // --- Loading / Error states ---
  if (uiState.status === 'loading') {
    return (
      <ScreenLayout>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (uiState.status === 'error') {
    return (
      <ScreenLayout>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ThemedIcon name="alert-circle-outline" size={48} colorName="error" />
          <ThemedText variant="titleMedium" style={{ marginTop: 10 }}>
            {uiState.message}
          </ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  if (uiState.status !== 'content') {
    return (
      <ScreenLayout>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ThemedIcon name="alert-circle-outline" size={48} colorName="error" />
          <ThemedText variant="titleMedium" style={{ marginTop: 10 }}>
            Listing not found
          </ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  const { listing, isOwner } = uiState.data;

  const getBadge = () => {
    switch (listing.type) {
      case 'service_offer':
        return { colorName: 'primary' as const, bgName: 'primaryContainer' as const, label: 'Service Offer' };
      case 'service_request':
        return { colorName: 'tertiary' as const, bgName: 'tertiaryContainer' as const, label: 'Need Help' };
      default:
        return { colorName: 'textSecondary' as const, bgName: 'surfaceVariant' as const, label: 'Post' };
    }
  };
  const badge = getBadge();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isHeaderScrolled ? (isDark ? 'light-content' : 'dark-content') : 'light-content'} 
        translucent 
        backgroundColor="transparent"
        animated={true}
      />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Background Image — stays completely still */}
      <View style={styles.imageBackground}>
        <Image
          source={{
            uri: listing.media_url || "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop",
          }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      </View>

      {/* Sticky Back Button */}
      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          { top: insets.top + Spacing.sm },
        ]}
      >
        <ThemedIcon name="chevron-left" size={26} lightColor="#fff" darkColor="#fff" />
      </Pressable>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Transparent spacer to reveal the image behind */}
        <View style={styles.imageSpacer} />

        {/* Content Card slides up over the image */}
        <ThemedView
          colorName="background"
          style={[styles.contentCard, horizontalPadding]}
        >
          {/* Type Badge */}
          <ThemedView colorName={badge.bgName} style={styles.typeBadge}>
            <ThemedText variant="labelSmall" colorName={badge.colorName} style={styles.typeBadgeText}>
              {badge.label}
            </ThemedText>
          </ThemedView>

          {/* Title */}
          <ThemedText variant="headlineSmall" style={styles.title}>
            {listing.title}
          </ThemedText>

          {/* Category */}
          <View style={styles.categoryRow}>
            <ThemedIcon name="folder-outline" size={16} colorName="primary" />
            <ThemedText variant="labelLarge" colorName="primary" style={{ marginLeft: 6 }}>
              {listing.category}
            </ThemedText>
          </View>

          {/* Meta info */}
          <View style={[styles.metaRow, { borderColor: theme.outlineVariant }]}>
            <View style={styles.metaItem}>
              <ThemedIcon name="calendar-outline" size={18} colorName="textMuted" />
              <ThemedText variant="labelSmall" colorName="textMuted">
                {new Date(listing.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <ThemedIcon name="star" size={18} lightColor="#fbbf24" darkColor="#fbbf24" />
              <ThemedText variant="labelSmall" colorName="textMuted">
                {listing.average_rating || '5.0'} ({listing.review_count || 0})
              </ThemedText>
            </View>
            {listing.level && (
              <View style={styles.metaItem}>
                <ThemedIcon name="shield-check-outline" size={18} colorName="textMuted" />
                <ThemedText variant="labelSmall" colorName="textMuted" style={{ textTransform: 'capitalize' }}>
                  {listing.level}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText variant="titleMedium" style={styles.sectionTitle}>
              About this service
            </ThemedText>
            <ThemedText variant="bodyLarge" colorName="textSecondary" style={styles.description}>
              {listing.description}
            </ThemedText>
          </View>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <View style={styles.section}>
              <ThemedText variant="titleMedium" style={styles.sectionTitle}>
                Tags
              </ThemedText>
              <View style={styles.tagGrid}>
                {listing.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.skillTag,
                      { backgroundColor: theme.surfaceVariant || theme.surface },
                    ]}
                  >
                    <ThemedText variant="labelLarge">#{tag}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Skills */}
          {listing.requiredSkills && listing.requiredSkills.length > 0 && (
            <View style={styles.section}>
              <ThemedText variant="titleMedium" style={styles.sectionTitle}>
                Expertise
              </ThemedText>
              <View style={styles.tagGrid}>
                {listing.requiredSkills.map((skill) => (
                  <View
                    key={skill}
                    style={[
                      styles.skillTag,
                      { backgroundColor: theme.surfaceVariant || theme.surface },
                    ]}
                  >
                    <ThemedText variant="labelLarge">{skill}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Provider Info - Hidden when coming from chat or profile to avoid redundancy and loops */}
          {fromChat !== 'true' && fromProfile !== 'true' && (
            <View style={styles.section}>
              <ThemedText variant="titleMedium" style={styles.sectionTitle}>
                {listing.type === 'service_offer' ? 'About the provider' : 'Posted by'}
              </ThemedText>
              <ThemedView
                colorName="surfaceVariant"
                style={styles.providerCard}
              >
                <View style={styles.providerRow}>
                  {owner?.profilePictureUrl ? (
                    <Image source={{ uri: owner.profilePictureUrl }} style={styles.providerAvatar} />
                  ) : (
                    <View style={[styles.providerAvatar, { backgroundColor: theme.primary + '20' }]}>
                      <ThemedIcon name="account" size={28} colorName="primary" />
                    </View>
                  )}
                  <View style={styles.providerInfo}>
                    <ThemedText variant="titleMedium" style={{ fontWeight: '700' }}>
                      {owner?.fullName ?? 'Campus Member'}
                    </ThemedText>
                    <ThemedText variant="bodySmall" colorName="textMuted">
                      {owner
                        ? `${owner.department ?? 'Student'} · Class of ${owner.graduationYear ?? '—'}`
                        : 'Loading…'}
                    </ThemedText>
                    {owner?.reputationScore !== undefined && owner.reputationScore > 0 && (
                      <View style={styles.providerStats}>
                        <ThemedIcon name="star" size={14} lightColor="#fbbf24" darkColor="#fbbf24" />
                        <ThemedText variant="labelSmall" colorName="textMuted">
                          {owner.reputationScore.toFixed(1)} · {owner.completedProjects ?? 0} completed
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <PrimaryButton
                  title="View Profile"
                  variant="ghost"
                  onPress={() =>
                    router.push({ pathname: '/profile/[id]', params: { id: listing.ownerId } })
                  }
                  size="small"
                />
              </ThemedView>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isOwner && (
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
              backgroundColor: theme.surface,
              borderTopColor: theme.outlineVariant,
            },
          ]}
        >
          <View style={[styles.bottomBarInner, horizontalPadding]}>
            {fromChat === 'true' ? (
              <PrimaryButton
                title="Back to Chat"
                onPress={() => router.back()}
                style={styles.messageBtn}
              />
            ) : (
              <PrimaryButton
                title="Send Message"
                onPress={() => router.replace({
                  pathname: "/chat/[id]",
                  params: { id: listing.ownerId, listingId: listing.id }
                })}
                style={styles.messageBtn}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Fixed background image layer
  imageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT,
    zIndex: 0,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  // Sticky back button
  backBtn: {
    position: 'absolute',
    left: Spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    ...Shadows.level2,
  },
  // Transparent spacer so the image is visible before scrolling
  imageSpacer: {
    height: IMAGE_HEIGHT - 28, // leave room for the overlap
  },
  // Content card that slides over the image
  contentCard: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    minHeight: 500,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  typeBadgeText: {
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  description: {
    lineHeight: 24,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  providerCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  providerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  providerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  // Bottom action bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    ...Shadows.level3,
  },
  bottomBarInner: {
    paddingTop: Spacing.md,
  },
  messageBtn: {
    width: '100%',
    height: 52,
    borderRadius: BorderRadius.lg,
  },
});
