import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Pressable, View, StatusBar } from 'react-native';
import { Image } from 'expo-image';
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
import { CAMPUS_CATEGORIES } from '@/constants/categories';
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
      try {
        const u = await api.getUserById(oid);
        if (!cancelled) setOwner(u);
      } catch (err) {
        console.error('Failed to fetch owner:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uiState]);

  const handleScroll = useCallback((e: any) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    if (scrollY > THRESHOLD && !isHeaderScrolled) {
      setIsHeaderScrolled(true);
    } else if (scrollY <= THRESHOLD && isHeaderScrolled) {
      setIsHeaderScrolled(false);
    }
  }, [isHeaderScrolled, THRESHOLD]);

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

  // Helper to get normalized category title
  const getNormalizedCategory = (cat: string) => {
    // Specifically handle the "Creative & Design" mismatch
    if (cat === 'Creative & Design') return 'Tech & Creative';
    
    // Try to find a match in official categories (by title or ID)
    const match = CAMPUS_CATEGORIES.find(c => c.title === cat || c.id === cat);
    return match ? match.title : cat;
  };
  const categoryTitle = getNormalizedCategory(listing.category);

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
          source={listing.media_url || "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop"}
          style={styles.mainImage}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
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
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        {/* Transparent spacer to reveal the image behind */}
        <View style={styles.imageSpacer} />

        {/* Content Card slides up over the image */}
        <ThemedView
          colorName="background"
          style={[styles.contentCard, horizontalPadding]}
        >
          {/* Pull Indicator / Handle */}
          <View style={styles.pullIndicatorWrapper}>
            <View style={[styles.pullIndicator, { backgroundColor: theme.outlineVariant }]} />
          </View>

          {/* Type Badge & Meta */}
          <View style={styles.cardHeader}>
            <ThemedView colorName={badge.bgName} style={styles.typeBadge}>
              <ThemedText variant="labelSmall" colorName={badge.colorName} style={styles.typeBadgeText}>
                {badge.label}
              </ThemedText>
            </ThemedView>
            
            <View style={styles.headerDate}>
              <ThemedIcon name="calendar-month-outline" size={14} colorName="textMuted" />
              <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginLeft: 4 }}>
                {new Date(listing.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </ThemedText>
            </View>
          </View>

          {/* Title & Category */}
          <View style={styles.mainTitleSection}>
            <ThemedText variant="headlineSmall" style={styles.title}>
              {listing.title}
            </ThemedText>
            
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIconCircle, { backgroundColor: theme.primary + '15' }]}>
                <ThemedIcon name="tag-outline" size={14} colorName="primary" />
              </View>
              <ThemedText variant="labelLarge" colorName="primary" style={styles.categoryText}>
                {categoryTitle}
              </ThemedText>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText variant="titleMedium" style={styles.sectionTitle}>
              {listing.type === 'service_offer' ? 'About this service' : 'About this request'}
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
                {listing.type === 'service_offer' ? 'Expertise' : 'Requirements'}
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
                <View style={styles.providerCenteredContent}>
                  {owner?.profilePictureUrl ? (
                    <Image source={{ uri: owner.profilePictureUrl }} style={styles.providerAvatarLarge} />
                  ) : (
                    <View style={[styles.providerAvatarLarge, { backgroundColor: theme.primary + '20' }]}>
                      <ThemedIcon name="account" size={40} colorName="primary" />
                    </View>
                  )}
                  
                  <ThemedText variant="titleLarge" style={styles.providerNameCentered}>
                    {owner?.fullName ?? 'Campus Member'}
                  </ThemedText>
                </View>

                <PrimaryButton
                  title="View Profile"
                  variant="ghost"
                  onPress={() =>
                    router.push({ pathname: '/profile/[id]', params: { id: listing.ownerId } })
                  }
                  style={styles.viewProfileBtn}
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    minHeight: 600,
    marginTop: -20, // Negative margin to overlap image slightly better
    ...Shadows.level3,
  },
  pullIndicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  pullIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerDate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainTitleSection: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontWeight: '900',
    fontSize: 26,
    lineHeight: 32,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: Spacing.md,
    letterSpacing: -0.2,
  },
  description: {
    lineHeight: 26,
    fontSize: 16,
    opacity: 0.9,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  providerCard: {
    padding: Spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    ...Shadows.level1,
  },
  providerCenteredContent: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  providerAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: Spacing.md,
  },
  providerNameCentered: {
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  viewProfileBtn: {
    marginTop: Spacing.sm,
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
