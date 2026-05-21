import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { filterProviderPosts } from '../../lib';
import { FeaturedPostCard } from '../FeaturedPostCard';
import {
  ProfileHeroSection,
  ProfileInfoRow,
  ProfileSegmentedTabs,
} from '../Profile';
import type { ProviderPostsTab, ProviderProfile } from '../../types';

export interface ProviderProfileViewProps {
  profile: ProviderProfile;
  onBack: () => void;
  onPostPress?: (postId: string) => void;
  onSendMessage?: () => void;
}

export const ProviderProfileView: React.FC<ProviderProfileViewProps> = ({
  profile,
  onBack,
  onPostPress,
  onSendMessage,
}) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const defaultTab: ProviderPostsTab = profile.posts.some((p) => p.tag === 'Service')
    ? 'services'
    : 'requests';
  const [activeTab, setActiveTab] = useState<ProviderPostsTab>(defaultTab);

  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const filteredPosts = useMemo(
    () => filterProviderPosts(profile.posts, activeTab),
    [profile.posts, activeTab]
  );

  const handleSendMessage = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSendMessage?.();
  }, [onSendMessage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]} numberOfLines={1}>
          {profile.displayName}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeroSection
          variant="public"
          displayName={profile.displayName}
          handle={profile.handle}
          avatarUrl={profile.avatarUrl}
          initials={initials}
          cardBg={cardBg}
          subtleBg={subtleBg}
          primaryColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          isDark={isDark}
          onMessage={handleSendMessage}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Information</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <ProfileInfoRow
            icon="at"
            iconColor={Colors.primary}
            iconBg={Colors.primary + '15'}
            label="Username"
            value={profile.handle}
            textColor={Colors.text}
            mutedColor={Colors.icon}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <ProfileInfoRow
            icon="document-text-outline"
            iconColor={Colors.secondary}
            iconBg={Colors.secondary + '15'}
            label="About Me"
            value={profile.bio}
            textColor={Colors.text}
            mutedColor={Colors.icon}
            multiline
          />
          {profile.skills.length > 0 ? (
            <>
              <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
              <View style={styles.skillsBlock}>
                <View style={[styles.skillsIconCircle, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="sparkles-outline" size={18} color="#F59E0B" />
                </View>
                <View style={styles.skillsContent}>
                  <Text style={[styles.skillsLabel, { color: Colors.icon }]}>Skills</Text>
                  <View style={styles.skillsWrap}>
                    {profile.skills.map((skill) => (
                      <View
                        key={skill}
                        style={[styles.skillPill, { backgroundColor: subtleBg }]}
                      >
                        <Text style={[styles.skillText, { color: Colors.text }]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Posts</Text>
        </View>
        <ProfileSegmentedTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          subtleBg={subtleBg}
          cardBg={cardBg}
          textColor={Colors.text}
        />

        <View style={styles.postsList}>
          {filteredPosts.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
              <Ionicons name="file-tray-outline" size={28} color={Colors.icon} />
              <Text style={[styles.emptyTitle, { color: Colors.text }]}>No posts yet</Text>
              <Text style={[styles.emptyBody, { color: Colors.icon }]}>
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
                textColor={Colors.text}
                mutedColor={Colors.icon}
                primaryColor={Colors.primary}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPostPress?.(post.id);
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    marginTop: Spacing.lg + 4,
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: {
    height: 1,
    marginLeft: 54,
  },
  skillsBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md - 2,
    paddingVertical: Spacing.sm + 2,
  },
  skillsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContent: {
    flex: 1,
  },
  skillsLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillPill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  skillText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
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

export default ProviderProfileView;
