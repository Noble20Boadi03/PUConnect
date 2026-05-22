import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { filterProviderPosts } from '../../lib';
import { FeaturedPostCard } from '../FeaturedPostCard';
import { ProfileSegmentedTabs } from './ProfileSegmentedTabs';
import type { FeaturedPost, ProviderPostsTab } from '../../types';

export interface ProfilePostsSectionProps {
  posts: FeaturedPost[];
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  onPostPress?: (postId: string) => void;
}

export const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  posts,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  onPostPress,
}) => {
  const defaultTab: ProviderPostsTab = posts.some((p) => p.tag === 'Service') ? 'services' : 'requests';
  const [activeTab, setActiveTab] = useState<ProviderPostsTab>(defaultTab);

  const filteredPosts = useMemo(
    () => filterProviderPosts(posts, activeTab),
    [posts, activeTab]
  );

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Posts</Text>
      </View>
      <ProfileSegmentedTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        subtleBg={subtleBg}
        cardBg={cardBg}
        textColor={textColor}
      />
      <View style={styles.postsList}>
        {filteredPosts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
            <Ionicons name="file-tray-outline" size={28} color={mutedColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No posts yet</Text>
            <Text style={[styles.emptyBody, { color: mutedColor }]}>
              {`No ${activeTab === 'services' ? 'services' : 'requests'} to show yet.`}
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPostPress?.(post.id);
              }}
            />
          ))
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: Spacing.lg + 4,
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
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
