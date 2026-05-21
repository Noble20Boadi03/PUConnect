import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import type { ChatPostContext } from '../../types';

export interface ChatContextBannerProps {
  context: ChatPostContext;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  officialEngagementActive?: boolean;
  officialEngagementCompleted?: boolean;
  officialCompletionPending?: boolean;
  /** Client must review provider's completion request. */
  officialCompletionNeedsReview?: boolean;
  onPress: () => void;
}

export const ChatContextBanner: React.FC<ChatContextBannerProps> = ({
  context,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  officialEngagementActive = false,
  officialEngagementCompleted = false,
  officialCompletionPending = false,
  officialCompletionNeedsReview = false,
  onPress,
}) => {
  const isService = context.tag === 'Service';
  const badgeBg = isService ? primaryColor + '22' : '#F59E0B22';
  const badgeColor = isService ? primaryColor : '#F59E0B';
  const officialAccent = isService ? primaryColor : '#F59E0B';

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: cardBg, borderBottomColor: subtleBg }]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Discussing ${context.title}. Open post details.`}
    >
      <View style={[styles.iconWrap, { backgroundColor: subtleBg }]}>
        <Ionicons name="document-text-outline" size={18} color={primaryColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: mutedColor }]} numberOfLines={1}>
          Discussing:{' '}
          <Text style={[styles.title, { color: textColor }]}>{context.title}</Text>
        </Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{context.tag}</Text>
          </View>
          {officialEngagementCompleted ? (
            <View style={[styles.officialBadge, { backgroundColor: officialAccent + '22' }]}>
              <Ionicons name="checkmark-circle" size={10} color={officialAccent} />
              <Text style={[styles.officialBadgeText, { color: officialAccent }]}>Complete</Text>
            </View>
          ) : officialCompletionNeedsReview ? (
            <View style={[styles.officialBadge, { backgroundColor: '#F59E0B22' }]}>
              <Ionicons name="alert-circle" size={10} color="#F59E0B" />
              <Text style={[styles.officialBadgeText, { color: '#F59E0B' }]}>Review</Text>
            </View>
          ) : officialCompletionPending ? (
            <View style={[styles.officialBadge, { backgroundColor: officialAccent + '22' }]}>
              <Ionicons name="time-outline" size={10} color={officialAccent} />
              <Text style={[styles.officialBadgeText, { color: officialAccent }]}>Pending</Text>
            </View>
          ) : officialEngagementActive ? (
            <View style={[styles.officialBadge, { backgroundColor: officialAccent + '22' }]}>
              <Ionicons name="shield-checkmark" size={10} color={officialAccent} />
              <Text style={[styles.officialBadgeText, { color: officialAccent }]}>Official</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={mutedColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  title: {
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default ChatContextBanner;
