import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  RefreshControlProps,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColor, usePullToRefreshOnHeader, useProviderReviews, selectCanReviewProvider } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import { ReportSheet } from '../ReportSheet';
import {
  ProfileHeroSection,
  ProfileInfoRow,
  ProfileReviewsSummaryRow,
  ProfilePostsSection,
} from '../Profile';
import type { ProviderProfile, ProviderReview } from '../../types';

export interface ProviderProfileViewProps {
  profile: ProviderProfile;
  reviews?: ProviderReview[];
  onBack: () => void;
  onPostPress?: (postId: string) => void;
  onSendMessage?: () => void;
  onOpenReviews?: () => void;
  onLeaveReview?: () => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ProviderProfileView: React.FC<ProviderProfileViewProps> = ({
  profile,
  reviews = [],
  onBack,
  onPostPress,
  onSendMessage,
  onOpenReviews,
  onLeaveReview,
  refreshControl,
  onRefresh,
  isRefreshing = false,
}) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const insets = useSafeAreaInsets();
  const { panHandlers } = usePullToRefreshOnHeader({ onRefresh: onRefresh || (() => {}), isRefreshing });
  const [reportSheetVisible, setReportSheetVisible] = useState(false);

  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const submittedReviews = useProviderReviews((s) => s.submittedReviews);
  const completedDeals = useProviderReviews((s) => s.completedDeals);

  const reviewSummary = useMemo(() => {
    const ownReviews = submittedReviews
      .filter((r) => r.revieweeUsername === profile.username)
      .map((r) => ({ ...r, isOwn: true } as ProviderReview));
      
    const ownReviewIds = new Set(ownReviews.map(r => r.id));
    const deduplicatedServerReviews = reviews.filter(r => !ownReviewIds.has(r.id));
    
    const allReviews = [...ownReviews, ...deduplicatedServerReviews];

    if (allReviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      averageRating: Math.round((total / allReviews.length) * 10) / 10,
      reviewCount: allReviews.length,
    };
  }, [submittedReviews, reviews, profile.username]);

  const canLeaveReview = useMemo(
    () => selectCanReviewProvider(completedDeals, submittedReviews, profile.username),
    [completedDeals, submittedReviews, profile.username]
  );

  const handleSendMessage = useCallback(() => {
    onSendMessage?.();
  }, [onSendMessage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <View {...panHandlers} style={styles.header}>
          <GuardedPressable
            style={[styles.backButton, { backgroundColor: subtleBg }]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </GuardedPressable>
          <Text style={[styles.headerTitle, { color: Colors.text }]} numberOfLines={1}>
            {profile.displayName}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

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
                  <Text style={[styles.skillsLabel, { color: Colors.icon }]}>
                    {profile.skills.length === 1 ? 'Service' : 'Services'}
                  </Text>
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
          {canLeaveReview && onLeaveReview ? (
            <>
              <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
              <GuardedPressable
                style={styles.leaveReviewRow}
                onPress={() => {
                  onLeaveReview?.();
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="create-outline" size={18} color={Colors.primary} />
                <Text style={[styles.leaveReviewText, { color: Colors.primary }]}>
                  Leave a review for a completed service
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </GuardedPressable>
            </>
          ) : null}
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <ProfileReviewsSummaryRow
            averageRating={reviewSummary.averageRating}
            reviewCount={reviewSummary.reviewCount}
            textColor={Colors.text}
            mutedColor={Colors.icon}
            onPress={() => {
              onOpenReviews?.();
            }}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <GuardedPressable
            style={styles.reportRow}
            onPress={() => setReportSheetVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="flag-outline" size={18} color={Colors.error} />
            <Text style={[styles.reportText, { color: Colors.error }]}>
              Report User
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.icon} />
          </GuardedPressable>
        </View>

        <ReportSheet
          visible={reportSheetVisible}
          targetType="user"
          targetId={profile.id}
          onClose={() => setReportSheetVisible(false)}
        />

        <ProfilePostsSection
        posts={profile.posts}
        isProvider
        showCreateFab={false}
        isOwnProfile={false}
        cardBg={cardBg}
        subtleBg={subtleBg}
        textColor={Colors.text}
        mutedColor={Colors.icon}
        primaryColor={Colors.primary}
        onPostPress={onPostPress}
      />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
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
  leaveReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xs,
  },
  leaveReviewText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xs,
  },
  reportText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export default ProviderProfileView;
