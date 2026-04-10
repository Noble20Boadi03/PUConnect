import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Pressable, View, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { useAuth } from '@/context/auth-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await api.getListing(id as string) as any;
      const listingData: Listing = {
        ...response,
        ownerId: response.ownerId ?? response.owner_id,
        createdAt: response.createdAt ?? response.created_at,
        requiredSkills: response.requiredSkills ?? response.required_skills,
      };
      setListing(listingData);
    } catch (error) {
      console.error("Error fetching listing:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!listing) {
    return (
      <ScreenLayout>
        <View style={styles.centered}>
          <ThemedIcon name="alert-circle-outline" size={48} colorName="error" />
          <ThemedText variant="titleMedium" style={{ marginTop: 10 }}>
            Listing not found
          </ThemedText>
        </View>
      </ScreenLayout>
    );
  }

  const isOwner = user?.id === listing.ownerId;

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Image Header */}
        <View style={styles.imageHeader}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop",
            }}
            style={styles.mainImage}
          />
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { top: insets.top + 10, backgroundColor: "rgba(0,0,0,0.3)" },
            ]}
          >
            <ThemedIcon name="chevron-left" size={28} lightColor="#fff" darkColor="#fff" />
          </Pressable>
        </View>

        <View style={[styles.content, { paddingHorizontal: Spacing.xl }]}>
          {/* Title and Price */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="headlineSmall" style={styles.title}>
                {listing.title}
              </ThemedText>
              <View style={styles.categoryRow}>
                <ThemedIcon name="folder-outline" size={16} colorName="primary" />
                <ThemedText
                  variant="labelLarge"
                  colorName="primary"
                  style={{ marginLeft: 6 }}
                >
                  {listing.category}
                </ThemedText>
              </View>
            </View>
            <ThemedText variant="headlineSmall" colorName="primary" style={styles.price}>
              ${listing.price || listing.budget || "25"}
            </ThemedText>
          </View>

          {/* Meta info */}
          <View style={[styles.metaRow, { borderColor: theme.border }]}>
            <View style={styles.metaItem}>
              <ThemedIcon name="calendar-outline" size={20} colorName="textMuted" />
              <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginTop: 4 }}>
                Posted {new Date(listing.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <ThemedIcon name="star" size={20} lightColor="#fbbf24" darkColor="#fbbf24" />
              <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginTop: 4 }}>
                4.9 Rating
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <ThemedIcon name="account" size={20} colorName="textMuted" />
              <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginTop: 4 }}>
                Verified Pro
              </ThemedText>
            </View>
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

          {/* Seller Info */}
          <View style={[styles.sellerCard, { backgroundColor: theme.surfaceVariant || theme.surface }]}>
            <View style={styles.sellerInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.primary + "15" }]}>
                <ThemedIcon name="account" size={32} colorName="primary" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <ThemedText variant="titleMedium">Campus Talent</ThemedText>
                <ThemedText variant="bodySmall" colorName="textMuted">
                  CS Student • 2nd Year
                </ThemedText>
              </View>
            </View>
            <PrimaryButton
              title="View Profile"
              variant="ghost"
              onPress={() => {}}
              size="small"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isOwner && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 20), backgroundColor: theme.surface },
          ]}
        >
          <PrimaryButton
            title="Send Message"
            onPress={() => router.push(`/chat/${listing.ownerId}?listingId=${listing.id}`)}
            style={{ flex: 1 }}
          />
          <Pressable
            style={[
              styles.chatBtn,
              { backgroundColor: theme.primary + "15" },
            ]}
          >
            <ThemedIcon name="chat-processing" size={24} colorName="primary" />
          </Pressable>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageHeader: {
        height: 250,
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    backBtn: {
        position: 'absolute',
        left: Spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingVertical: Spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    price: {
        fontWeight: '700',
    },
    section: {
        marginTop: Spacing.xl,
    },
    tagGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    sellerCard: {
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadows.level1,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    chatBtn: {
        width: 54,
        height: 54,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.md,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        backgroundColor: '#e0e7ff',
        marginBottom: Spacing.sm,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    title: {
        fontWeight: '800',
        marginBottom: Spacing.xs,
    },
    priceInfo: {
        fontSize: 20,
        fontWeight: '700',
    },
    card: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
        ...Shadows.level1,
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    description: {
        marginTop: Spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginTop: Spacing.sm,
        paddingTop: Spacing.lg,
        borderTopWidth: 1,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    skillText: {
        fontSize: 13,
        fontWeight: '500',
    },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ownerInfo: {
        marginLeft: Spacing.md,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: '700',
    },
    ownerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 54,
        borderRadius: BorderRadius.lg,
        gap: 8,
        ...Shadows.level2,
    },
    messageButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
