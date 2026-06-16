import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GuardedPressable } from '../GuardedPressable';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import type { ConversationPreview } from '../../types';

function getInitials(name: string): string {
  if (!name) return '??';
  
  // Clean the name and handle edge cases
  const cleanedName = name.trim();
  if (!cleanedName) return '??';
  
  const parts = cleanedName.split(/\s+/).filter(Boolean);
  
  // If only one part, take first 2 characters (or 1 if only 1 exists)
  if (parts.length === 1) {
    return cleanedName.slice(0, 2).toUpperCase();
  }
  
  // If multiple parts, take first character of first two parts
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

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
  onPressIn?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: () => void;
  onLongPress?: () => void;
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
  onPressIn,
  selectionMode = false,
  isSelected = false,
  onSelectToggle,
  onLongPress,
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
    <GuardedPressable
      style={[
        styles.row,
        unread && !isSelected && { backgroundColor: unreadTint },
        isSelected && { backgroundColor: primaryColor + '12' },
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dividerColor },
      ]}
      onPress={selectionMode && onSelectToggle ? onSelectToggle : onPress}
      onPressIn={onPressIn}
      onLongPress={onLongPress}
      delayLongPress={450}
      activeOpacity={0.72}
      delayPressIn={50}
    >
      <View style={styles.avatarColumn}>
        {isSelected ? (
          <View style={[styles.avatarRing, styles.selectedRing]}>
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" style={styles.selectedIcon} />
          </View>
        ) : (
          <>
            <View style={[styles.avatarRing, isOnline && { borderColor: '#22C55E' }]}>
              <View style={[styles.avatar, { backgroundColor: primaryColor + '18' }]}>
                {participant.avatarUrl ? (
                  <Image
                    source={{ uri: participant.avatarUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    transition={0}
                  />
                ) : (
                  <Text style={[styles.avatarInitials, { color: primaryColor }]}>
                    {getInitials(participant.displayName)}
                  </Text>
                )}
              </View>
            </View>
            {isOnline ? (
              <View style={[styles.onlineDot, { borderColor: onlineBorderColor }]} />
            ) : null}
          </>
        )}
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
    </GuardedPressable>
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
  selectedRing: {
    backgroundColor: 'transparent',
  },
  selectedIcon: {
    margin: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
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
