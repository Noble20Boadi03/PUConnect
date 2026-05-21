import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
}) => {
  if (message.kind === 'system') {
    return (
      <View style={styles.systemRow}>
        <View style={[styles.systemBubble, { backgroundColor: systemBg }]}>
          <Ionicons name="shield-checkmark" size={14} color={primaryColor} />
          <Text style={[styles.systemText, { color: mutedColor }]}>{message.text}</Text>
        </View>
        <Text style={[styles.time, styles.timeSystem, { color: mutedColor }]}>{message.time}</Text>
      </View>
    );
  }

  const isSent = message.kind === 'sent';

  return (
    <View style={[styles.row, isSent ? styles.rowSent : styles.rowReceived]}>
      <View
        style={[
          styles.bubble,
          isSent
            ? [styles.bubbleSent, { backgroundColor: sentBg }]
            : [styles.bubbleReceived, { backgroundColor: receivedBg }],
        ]}
      >
        <Text style={[styles.text, { color: isSent ? sentText : receivedText }]}>
          {message.text}
        </Text>
      </View>
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
  text: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 21,
  },
  time: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  systemRow: {
    alignSelf: 'center',
    alignItems: 'center',
    maxWidth: '92%',
    marginBottom: Spacing.md,
  },
  systemBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 20,
  },
  systemText: {
    flex: 1,
    fontSize: Typography.size.xs,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
  timeSystem: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

export default ChatMessageBubble;
