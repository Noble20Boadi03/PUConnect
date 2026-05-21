import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import type { ChatParticipant } from '../../types';

export interface ChatHeaderProps {
  participant: ChatParticipant;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  onBack: () => void;
  onMoreOptions?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  participant,
  subtleBg,
  textColor,
  mutedColor,
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

    <Image
      source={{ uri: participant.avatarUrl }}
      style={styles.avatar}
      contentFit="cover"
      transition={0}
    />

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
