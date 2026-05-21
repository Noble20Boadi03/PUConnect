import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import type { ConversationPreview } from '../../types';

export interface ConversationListItemProps {
  conversation: ConversationPreview;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  unreadTint: string;
  contextPillBg: string;
  dividerColor: string;
  onlineBorderColor: string;
  isLast?: boolean;
  onPress: () => void;
}

const ConversationListItemComponent: React.FC<ConversationListItemProps> = ({
  conversation,
  textColor,
  mutedColor,
  primaryColor,
  unreadTint,
  contextPillBg,
  dividerColor,
  onlineBorderColor,
  isLast = false,
  onPress,
}) => {
  const {
    participant,
    contextLine,
    lastMessage,
    timestamp,
    unread,
    unreadCount,
    isOnline,
    isPinned,
  } = conversation;

  const showBadge = unread && (unreadCount ?? 0) > 0;
  const badgeLabel = unreadCount && unreadCount > 9 ? '9+' : String(unreadCount ?? '');

  return (
    <TouchableOpacity
      style={[
        styles.row,
        unread && { backgroundColor: unreadTint },
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dividerColor },
      ]}
      onPress={onPress}
      activeOpacity={0.72}
      delayPressIn={50}
    >
      <View style={styles.avatarColumn}>
        <View style={[styles.avatarRing, isOnline && { borderColor: '#22C55E' }]}>
          <Image
            source={{ uri: participant.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={0}
          />
        </View>
        {isOnline ? (
          <View style={[styles.onlineDot, { borderColor: onlineBorderColor }]} />
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.topLine}>
          <View style={styles.nameRow}>
            {isPinned ? (
              <Ionicons
                name="pin"
                size={12}
                color={primaryColor}
                style={styles.pinIcon}
              />
            ) : null}
            <Text
              style={[
                styles.name,
                { color: textColor },
                unread && styles.nameUnread,
              ]}
              numberOfLines={1}
            >
              {participant.displayName}
            </Text>
          </View>
          <Text
            style={[
              styles.time,
              { color: unread ? primaryColor : mutedColor },
              unread && styles.timeUnread,
            ]}
          >
            {timestamp}
          </Text>
        </View>

        {contextLine ? (
          <View style={[styles.contextPill, { backgroundColor: contextPillBg }]}>
            <Ionicons name={contextLine.icon} size={11} color={primaryColor} />
            <Text style={[styles.contextText, { color: mutedColor }]} numberOfLines={1}>
              {contextLine.text}
            </Text>
          </View>
        ) : (
          <Text style={[styles.handle, { color: mutedColor }]} numberOfLines={1}>
            {participant.handle}
          </Text>
        )}

        <View style={styles.previewRow}>
          <Text
            style={[
              styles.preview,
              { color: mutedColor },
              unread && { color: textColor, fontWeight: '600' },
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          {showBadge ? (
            <View style={[styles.badge, { backgroundColor: primaryColor }]}>
              <Text style={styles.badgeText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    gap: Spacing.md,
  },
  avatarColumn: {
    position: 'relative',
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  pinIcon: {
    marginRight: 4,
  },
  name: {
    flex: 1,
    fontSize: Typography.size.md,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  nameUnread: {
    fontWeight: '800',
  },
  time: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  timeUnread: {
    fontWeight: '700',
  },
  handle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    maxWidth: '100%',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  contextText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  preview: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 18,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export const ConversationListItem = memo(ConversationListItemComponent);

export default ConversationListItem;
