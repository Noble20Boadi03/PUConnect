import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import type { ChatMessage } from '../../types';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  sentBg: string;
  sentText: string;
  receivedBg: string;
  receivedText: string;
  mutedColor: string;
  primaryColor: string;
  systemBg: string;
  systemAccent?: string;
  onRetry?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onLongPress?: (message: ChatMessage) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  sentBg,
  sentText,
  receivedBg,
  receivedText,
  mutedColor,
  primaryColor,
  systemBg,
  systemAccent,
  onRetry,
  onDelete,
  onLongPress,
}) => {
  const accent = systemAccent ?? primaryColor;

  const handlePress = () => {
    if (message.status === 'failed') {
      Alert.alert(
        'Message Failed',
        'This message could not be sent.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(message) },
          { text: 'Retry', onPress: () => onRetry?.(message) },
        ]
      );
    }
  };

  const handleLongPressHandler = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress(message);
    }
  };

  if (message.kind === 'system') {
    return (
      <View style={styles.systemMessageRow}>
        <View style={[styles.systemDividerLine, { backgroundColor: mutedColor }]} />
        <Text style={[styles.systemMessageText, { color: mutedColor }]}>{message.text}</Text>
        <View style={[styles.systemDividerLine, { backgroundColor: mutedColor }]} />
      </View>
    );
  }

  const isSent = message.kind === 'sent';

  return (
    <View style={[styles.row, isSent ? styles.rowSent : styles.rowReceived]}>
      <Pressable
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        style={({ pressed }) => [
          styles.bubble,
          isSent
            ? [styles.bubbleSent, { backgroundColor: message.status === 'failed' ? '#FCA5A5' : sentBg }]
            : [styles.bubbleReceived, { backgroundColor: receivedBg }],
          pressed && { opacity: 0.85 }
        ]}
        onPress={message.status === 'failed' ? handlePress : undefined}
        onLongPress={handleLongPressHandler}
      >
        <View style={styles.messageContent}>
          <Text style={[styles.text, { color: isSent ? (message.status === 'failed' ? '#7F1D1D' : sentText) : receivedText }]}>
            {message.text}
          </Text>
          {message.status === 'pending' && (
            <ActivityIndicator 
              size="small" 
              color={isSent ? sentText : mutedColor} 
              style={styles.loadingIndicator}
            />
          )}
          {message.status === 'failed' && (
            <Ionicons name="warning" size={16} color="#B91C1C" style={styles.errorIcon} />
          )}
        </View>
      </Pressable>
      <Text style={[styles.time, { color: mutedColor }]}>{message.time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: Spacing.md,
    maxWidth: '82%',
  },
  rowSent: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowReceived: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 18,
  },
  bubbleSent: {
    borderBottomRightRadius: 6,
  },
  bubbleReceived: {
    borderBottomLeftRadius: 6,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 21,
  },
  loadingIndicator: {
    opacity: 0.8,
  },
  errorIcon: {
    marginLeft: Spacing.xs,
  },
  time: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  systemMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  systemDividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  systemMessageText: {
    fontSize: 11,
    textAlign: 'center',
    flexShrink: 1,
    fontStyle: 'italic',
  },
});

export default ChatMessageBubble;
