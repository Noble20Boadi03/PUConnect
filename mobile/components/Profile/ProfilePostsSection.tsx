import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { filterProviderPosts } from '../../lib';
import { useAppRouter, useThemeColor } from '../../hooks';
import { FeaturedPostCard } from '../FeaturedPostCard';
import { ProfileSegmentedTabs } from './ProfileSegmentedTabs';
import { ProfileProviderGate } from './ProfileProviderGate';
import type { FeaturedPost, ProviderPostsTab } from '../../types';

export interface ProfilePostsSectionProps {
  posts: FeaturedPost[];
  /** Owner profile: gates services tab + FAB when false. Public provider profiles should pass true. */
  isProvider?: boolean;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  onPostPress?: (postId: string) => void;
  onBecomeProvider?: () => void;
  /** Hide create FAB on public provider pages. */
  showCreateFab?: boolean;
  /** Hide author avatar/name on post cards (signed-in owner profile). */
  hideAuthorOnCards?: boolean;
  /** Whether this is the current user's own profile */
  isOwnProfile?: boolean;
}

export const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  posts,
  isProvider = true,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  onPostPress,
  onBecomeProvider = () => {},
  showCreateFab = true,
  hideAuthorOnCards = false,
  isOwnProfile = true,
}) => {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const defaultTab: ProviderPostsTab = isProvider && posts.some((p) => p.tag === 'Service')
    ? 'services'
    : 'requests';
  const [activeTab, setActiveTab] = useState<ProviderPostsTab>(defaultTab);

  const filteredPosts = useMemo(
    () => filterProviderPosts(posts, activeTab),
    [posts, activeTab]
  );

  const showProviderGate = activeTab === 'services' && !isProvider;
  const showFab =
    showCreateFab && (activeTab === 'requests' || (activeTab === 'services' && isProvider));

  const handleCreatePress = () => {
    const type = activeTab === 'services' ? 'service' : 'request';
    router.push(`/new-post?type=${type}` as any);
  };

  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Posts</Text>
        {showFab ? (
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: primaryColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleCreatePress();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create post"
          >
            <Ionicons name="add" size={16} color={Colors.onPrimary} />
            <Text style={[styles.createButtonText, { color: Colors.onPrimary }]}>New</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ProfileSegmentedTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        subtleBg={subtleBg}
        cardBg={cardBg}
        textColor={textColor}
        servicesEnabled={isProvider}
      />
      <View style={styles.postsList}>
        {showProviderGate ? (
          <ProfileProviderGate
            cardBg={cardBg}
            textColor={textColor}
            mutedColor={mutedColor}
            primaryColor={primaryColor}
            onBecomeProvider={onBecomeProvider}
          />
        ) : filteredPosts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
            <Ionicons name="file-tray-outline" size={28} color={mutedColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No posts yet</Text>
            <Text style={[styles.emptyBody, { color: mutedColor }]}>
              {activeTab === 'services'
                ? isOwnProfile
                  ? 'Create a service listing to appear here.'
                  : 'This provider has no service listings yet.'
                : isOwnProfile
                  ? 'Create a request to find help from peers on campus.'
                  : 'This provider has no requests yet.'}
            </Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
            <FeaturedPostCard
              key={post.id}
              item={post}
              cardBg={cardBg}
              subtleBg={subtleBg}
              textColor={textColor}
              mutedColor={mutedColor}
              primaryColor={primaryColor}
              showAuthor={!hideAuthorOnCards}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPostPress?.(post.id);
              }}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionWrap: {
    position: 'relative',
    minHeight: 200,
    paddingBottom: 72,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg + 4,
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 2,
  },
  createButtonText: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  postsList: {
    marginTop: Spacing.md,
  },
  emptyCard: {
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfilePostsSection;
