import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import type { ChatParticipant } from '../../types';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export interface ChatHeaderProps {
  participant: ChatParticipant;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  onBack: () => void;
  onMoreOptions?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  participant,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  onBack,
  onMoreOptions,
}) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={[styles.iconButton, { backgroundColor: subtleBg }]}
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="chevron-back" size={22} color={textColor} />
    </TouchableOpacity>

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

    <View style={styles.identity}>
      <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
        {participant.displayName}
      </Text>
      <Text style={[styles.handle, { color: mutedColor }]} numberOfLines={1}>
        {participant.handle}
      </Text>
    </View>

    <TouchableOpacity
      style={[styles.iconButton, { backgroundColor: subtleBg }]}
      onPress={onMoreOptions}
      accessibilityRole="button"
      accessibilityLabel="More options"
    >
      <Ionicons name="ellipsis-vertical" size={22} color={textColor} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  handle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: 1,
  },
});

export default ChatHeader;
