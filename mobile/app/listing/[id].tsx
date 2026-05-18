import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Pressable, View, StatusBar, Dimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useAuth } from '@/context/auth-context';

const IMAGE_HEIGHT = 320;

export default function ListingDetailsScreen() {
  const { id, fromChat, fromProfile } = useLocalSearchParams<{ id: string; fromChat?: string; fromProfile?: string }>();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = Dimensions.get('window');

  const { uiState } = useListingViewModel(id as string);
  const { contentPaddingLeft, contentPaddingRight } = useResponsive();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

  const [owner, setOwner] = useState<User | null>(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const horizontalScrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<ScrollView>(null);

  // Determine the display images dynamically at the top of the component to obey React Rules of Hooks
  const imagesToDisplay = useMemo(() => {
    if (uiState.status !== 'content') return [];
    const { listing } = uiState.data;
    const categoryData = CAMPUS_CATEGORIES.find(c => c.title === listing.category || c.id === listing.category);
    const fallbackImage = categoryData?.image || require('@/assets/images/categories/campus_life.jpg');

    return (listing.type === 'service_offer' && listing.media_urls && listing.media_urls.length > 0)
      ? listing.media_urls 
      : [listing.media_url || fallbackImage];
  }, [uiState]);

  const hasMultipleImages = imagesToDisplay.length > 1;

  const handleCarouselScrollEnd = useCallback((e: any) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setActiveImageIndex(index);
  }, [width]);

  const handlePrevImage = useCallback(() => {
    if (activeImageIndex > 0) {
      const nextIndex = activeImageIndex - 1;
      (carouselRef.current as any)?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setActiveImageIndex(nextIndex);
    }
  }, [activeImageIndex, width]);

  const handleNextImage = useCallback(() => {
    if (activeImageIndex < imagesToDisplay.length - 1) {
      const nextIndex = activeImageIndex + 1;
      (carouselRef.current as any)?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setActiveImageIndex(nextIndex);
    }
  }, [activeImageIndex, imagesToDisplay.length, width]);

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
    const y = e.nativeEvent.contentOffset.y;
    if (y > THRESHOLD && !isHeaderScrolled) {
      setIsHeaderScrolled(true);
    } else if (y <= THRESHOLD && isHeaderScrolled) {
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

  const { listing } = uiState.data;

  const getBadge = () => {
    switch (listing.type) {
      case 'service_offer':
        return { colorName: 'primary' as const, bgName: 'primaryContainer' as const, label: 'Service Offer', themeColor: 'primary' as const };
      case 'service_request':
        return { colorName: 'tertiary' as const, bgName: 'tertiaryContainer' as const, label: 'Request', themeColor: 'tertiary' as const };
      default:
        return { colorName: 'textSecondary' as const, bgName: 'surfaceVariant' as const, label: 'Post', themeColor: 'primary' as const };
    }
  };
  const badge = getBadge();
  const themeColor = badge.themeColor;

  const getNormalizedCategory = (cat: string) => {
    const found = CAMPUS_CATEGORIES.find(c => c.title === cat);
    if (found) return found.title;
    if (cat.toLowerCase().includes('creative') || cat.toLowerCase().includes('design')) return 'Tech & Creative';
    return cat;
  };

  const categoryTitle = listing ? getNormalizedCategory(listing.category) : '';

  const canInteractWithRequest = () => {
    if (!listing || !user) return false;
    if (listing.type !== 'service_request') return true;
    if (user.id === listing.ownerId) return false;
    if (!user.canOfferServices) return false;

    // 1. Resolve IDs for reliable comparison
    const listingCatId = CAMPUS_CATEGORIES.find(c => c.title === listing.category || c.id === listing.category)?.id;
    const userCatId = user.category; // Now formally part of User type

    // 2. Normalize skills/tags for comparison
    const userSkills = (user.skillTags || []).map(s => s.toLowerCase());
    const listingSub = listing.subcategory?.toLowerCase();
    const listingTags = (listing.tags || []).map(t => t.toLowerCase());

    // RULE A: Direct Category Match (e.g. both in 'academics')
    if (listingCatId && userCatId && listingCatId === userCatId) return true;

    // RULE B: Subcategory Match (e.g. listing is 'Logo Design' and provider has 'Logo Design' in skills)
    if (listingSub && userSkills.includes(listingSub)) return true;

    // RULE C: Tag Overlap (e.g. shared keywords)
    if (listingTags.some(tag => userSkills.includes(tag))) return true;

    return false;
  };

  const isQualifiedProvider = canInteractWithRequest();
  const isOwner = user?.id === listing?.ownerId;


  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isHeaderScrolled ? (isDark ? 'light-content' : 'dark-content') : 'light-content'} 
        translucent 
        backgroundColor="transparent"
        animated={true}
      />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Background Image Layer */}
      <View style={styles.imageBackground}>
        {hasMultipleImages ? (
          <Animated.View
            style={{
              flexDirection: 'row',
              width: width * imagesToDisplay.length,
              height: '100%',
              transform: [{
                translateX: horizontalScrollX.interpolate({
                  inputRange: [0, width * (imagesToDisplay.length - 1)],
                  outputRange: [0, -width * (imagesToDisplay.length - 1)],
                })
              }]
            }}
          >
            {imagesToDisplay.map((url: any, i: number) => (
              <Image
                key={i}
                source={typeof url === 'string' ? { uri: url } : url}
                style={{ width, height: '100%' }}
                contentFit="cover"
                cachePolicy="disk"
              />
            ))}
          </Animated.View>
        ) : (
          <Image
            source={imagesToDisplay[0]}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="disk"
            transition={200}
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Pagination Dots (Stationary on Image Area, overlayed by ScrollView content card) */}
      {hasMultipleImages && (
        <View style={{ position: 'absolute', top: IMAGE_HEIGHT - 44, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6, zIndex: 5 }}>
          {imagesToDisplay!.map((_: any, i: number) => {
            const isActive = activeImageIndex === i;
            return (
              <View
                key={i}
                style={{
                  width: isActive ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              />
            );
          })}
        </View>
      )}

      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          { top: insets.top + Spacing.sm },
        ]}
      >
        <BlurView intensity={30} tint="dark" style={styles.backBtnBlur}>
          <ThemedIcon name="chevron-left" size={26} lightColor="#fff" darkColor="#fff" />
        </BlurView>
      </Pressable>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        {/* Transparent Horizontal Gesture Receiver */}
        {hasMultipleImages ? (
          <View style={{ height: IMAGE_HEIGHT, width: '100%', position: 'relative' }}>
            <Animated.ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ width: '100%', height: '100%' }}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: horizontalScrollX } } }],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={handleCarouselScrollEnd}
            >
              {imagesToDisplay!.map((_: any, i: number) => (
                <View key={i} style={{ width, height: IMAGE_HEIGHT }} />
              ))}
            </Animated.ScrollView>

            {/* Navigation Arrows */}
            {activeImageIndex > 0 && (
              <Pressable
                onPress={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: IMAGE_HEIGHT / 2 - 20,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 30,
                }}
              >
                <ThemedIcon name="chevron-left" size={24} lightColor="#fff" darkColor="#fff" />
              </Pressable>
            )}

            {activeImageIndex < imagesToDisplay.length - 1 && (
              <Pressable
                onPress={handleNextImage}
                style={{
                  position: 'absolute',
                  right: 16,
                  top: IMAGE_HEIGHT / 2 - 20,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 30,
                }}
              >
                <ThemedIcon name="chevron-right" size={24} lightColor="#fff" darkColor="#fff" />
              </Pressable>
            )}
          </View>
        ) : (
          <View style={{ height: IMAGE_HEIGHT, width: '100%' }} />
        )}

        <ThemedView
          colorName="background"
          style={[styles.contentCard, horizontalPadding]}
        >
          <View style={styles.pullIndicatorWrapper}>
            <View style={[styles.pullIndicator, { backgroundColor: theme.outlineVariant }]} />
          </View>

          <View style={styles.cardHeader}>
            <ThemedView colorName={badge.bgName} style={styles.typeBadge}>
              <ThemedText variant="labelSmall" colorName={badge.colorName} style={styles.typeBadgeText}>
                {badge.label}
              </ThemedText>
            </ThemedView>
            
            <View style={styles.headerDate}>
              <ThemedIcon name="clock-outline" size={14} colorName="textMuted" />
              <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginLeft: 4 }}>
                {new Date(listing.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </ThemedText>
            </View>
          </View>

          <View style={styles.mainTitleSection}>
            <View style={styles.titlePriceRow}>
              <ThemedText variant="headlineSmall" style={styles.title}>
                {listing.title}
              </ThemedText>
              <View style={styles.priceContainer}>
                <ThemedText variant="headlineSmall" colorName={themeColor} style={styles.priceText}>
                  ${listing.price || listing.budget || 0}
                </ThemedText>
                {listing.priceType === 'starting_at' && (
                  <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginTop: -4 }}>
                    Starting at
                  </ThemedText>
                )}
              </View>
            </View>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <View style={[styles.metaIconCircle, { backgroundColor: theme[themeColor] + '15' }]}>
                  <ThemedIcon name="tag-outline" size={12} colorName={themeColor} />
                </View>
                <ThemedText variant="labelLarge" colorName={themeColor} style={styles.metaText}>
                  {categoryTitle}
                </ThemedText>
              </View>

              {listing.subcategory && (
                <View style={styles.metaItem}>
                  <View style={[styles.metaIconCircle, { backgroundColor: theme.primary + '15' }]}>
                    <ThemedIcon name="layers-outline" size={12} colorName="primary" />
                  </View>
                  <ThemedText variant="labelLarge" colorName="primary" style={styles.metaText}>
                    {listing.subcategory}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText variant="titleMedium" style={styles.sectionTitle}>
              {listing.type === 'service_offer' ? 'About this service' : 'About this request'}
            </ThemedText>
            <ThemedText variant="bodyLarge" colorName="textSecondary" style={styles.description}>
              {listing.description}
            </ThemedText>
          </View>

          {listing.type === 'service_request' && listing.urgency ? (
            <View style={styles.section}>
              <View style={styles.urgencyContainer}>
                <ThemedIcon name="alert-circle-outline" size={20} colorName="error" />
                <View style={{ marginLeft: Spacing.sm }}>
                  <ThemedText variant="labelSmall" colorName="error" style={{ fontWeight: '700', textTransform: 'uppercase' }}>
                    Urgency
                  </ThemedText>
                  <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>
                    {listing.urgency}
                  </ThemedText>
                </View>
              </View>
            </View>
          ) : null}

          {(listing.tags?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <ThemedText variant="titleMedium" style={styles.sectionTitle}>
                Tags
              </ThemedText>
              <View style={styles.tagGrid}>
                {listing.tags!.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.skillTag,
                      { backgroundColor: theme.surfaceVariant || theme.surface },
                    ]}
                  >
                    <ThemedText variant="labelSmall" colorName="textSecondary">#{tag}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {listing.type === 'service_offer' && (listing.requiredSkills?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <ThemedText variant="titleMedium" style={styles.sectionTitle}>
                Expertise
              </ThemedText>
              <View style={styles.tagGrid}>
                {listing.requiredSkills!.map((skill) => (
                  <View
                    key={skill}
                    style={[
                      styles.skillTag,
                      { backgroundColor: theme.primaryContainer + '20' },
                    ]}
                  >
                    <ThemedText variant="labelSmall" colorName="primary">{skill}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {fromChat !== 'true' && fromProfile !== 'true' && (
            <View style={styles.section}>
              <ThemedText variant="titleMedium" style={styles.sectionTitle}>
                {listing.type === 'service_offer' ? 'About the provider' : 'Posted by'}
              </ThemedText>
              <ThemedView
                colorName="surface"
                style={[styles.providerCard, { borderColor: theme.outlineVariant }]}
              >
                <Pressable 
                  onPress={() => router.push({ pathname: '/profile/[id]', params: { id: listing.ownerId } })}
                  style={styles.providerCardLayout}
                >
                  <View style={styles.providerImageWrapper}>
                    {owner?.profilePictureUrl ? (
                      <Image source={{ uri: owner.profilePictureUrl }} style={styles.providerImage} />
                    ) : (
                      <View style={[styles.providerImage, { backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center' }]}>
                        <ThemedText 
                          variant="headlineSmall" 
                          colorName="primary" 
                          style={{ fontWeight: 'bold' }}
                        >
                          {(owner?.fullName || 'C').charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  <View style={styles.providerRightSection}>
                    <ThemedText variant="titleLarge" style={styles.providerName}>
                      {owner?.fullName ?? 'Campus Member'}
                    </ThemedText>
                    
                    <View style={styles.providerInfoRow}>
                      {owner?.username && (
                        <ThemedText variant="labelLarge" colorName="primary" style={styles.usernameText}>
                          @{owner.username}
                        </ThemedText>
                      )}
                    </View>

                    <View style={styles.tagsRow}>
                      {owner?.skillTags?.slice(0, 3).map((tag: string, idx: number) => (
                        <View key={idx} style={[styles.tagPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }]}>
                          <ThemedText variant="labelSmall" colorName="textSecondary" style={{ fontWeight: '600' }}>{tag}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                </Pressable>
              </ThemedView>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.surface, borderTopColor: theme.outlineVariant }]}>
        <View style={[styles.bottomBarInner, horizontalPadding]}>
          {isOwner ? (
            <PrimaryButton
              title="Edit My Listing"
              variant="outline"
              onPress={() => router.push({ pathname: '/listing/create', params: { editId: listing.id } })}
              style={styles.messageBtn}
            />
          ) : listing.type === 'service_request' && !isQualifiedProvider ? (
            <View style={styles.restrictedNotice}>
              <ThemedIcon name="lock-outline" size={16} colorName="textMuted" />
              <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginLeft: 6, flex: 1 }}>
                {user?.canOfferServices 
                  ? `Only providers with expertise in ${categoryTitle} can respond to this request.`
                  : "Complete your provider profile to respond to student requests."}
              </ThemedText>
            </View>
          ) : fromChat === 'true' ? (
            <PrimaryButton
              title="Back to Chat"
              variant={themeColor as any}
              onPress={() => router.back()}
              style={styles.messageBtn}
            />
          ) : (
            <PrimaryButton
              title="Send Message"
              variant={themeColor as any}
              onPress={() => router.replace({
                pathname: "/chat/[id]",
                params: { id: listing.ownerId, listingId: listing.id }
              })}
              style={styles.messageBtn}
            />
          )}
        </View>
      </View>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    zIndex: 100,
    ...Shadows.level2,
  },
  backBtnBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Transparent spacer so the image is visible before scrolling
  imageSpacer: {
    height: IMAGE_HEIGHT - 32, // leave room for the overlap
  },
  // Content card that slides over the image
  contentCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    minHeight: 500,
    marginTop: -20,
    ...Shadows.level3,
  },
  pullIndicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  pullIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
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
    backgroundColor: 'rgba(128,128,128,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainTitleSection: {
    marginBottom: Spacing.xl,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontWeight: '900',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: -1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.08)',
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 16,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  description: {
    lineHeight: 26,
    fontSize: 17,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  providerCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.level1,
  },
  providerCardLayout: {
    flexDirection: 'row',
    padding: 16,
  },
  providerImageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 22,
    overflow: 'hidden',
  },
  providerImage: {
    width: '100%',
    height: '100%',
  },
  providerRightSection: {
    flex: 1,
    paddingLeft: 18,
    justifyContent: 'center',
  },
  providerName: {
    fontWeight: '900',
    fontSize: 22,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  providerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  departmentText: {
    fontWeight: '500',
    fontSize: 16,
  },
  usernameText: {
    fontWeight: '700',
    fontSize: 15,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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
    height: 56,
    borderRadius: 16,
  },
  restrictedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
});
