import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Spacing, Typography } from '../../constants';
import type { ChatMessage } from '../../types';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  sentBg: string;
  sentText: string;
  receivedBg: string;
  receivedText: string;
  mutedColor: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  sentBg,
  sentText,
  receivedBg,
  receivedText,
  mutedColor,
}) => {
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
});

export default ChatMessageBubble;
