import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';

export interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onAttach?: () => void;
  onSend?: () => void;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  bottomInset: number;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  onChangeText,
  onAttach,
  onSend,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  bottomInset,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const canSend = value.trim().length > 0;
  const sendIconColor = canSend ? (isDark ? '#09090B' : '#FFFFFF') : mutedColor;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: cardBg,
          borderTopColor: subtleBg,
          paddingBottom: Math.max(bottomInset, Spacing.sm),
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.attachButton, { backgroundColor: subtleBg }]}
        onPress={onAttach}
        accessibilityRole="button"
        accessibilityLabel="Attach file"
      >
        <Ionicons name="attach" size={22} color={primaryColor} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { backgroundColor: subtleBg, color: textColor }]}
        placeholder="Type a message..."
        placeholderTextColor={mutedColor}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={2000}
      />

      {canSend ? (
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: primaryColor }]}
          onPress={onSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons name="send" size={20} color={sendIconColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm + 4,
    borderTopWidth: 1,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});

export default ChatComposer;
