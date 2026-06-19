import React, { useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import type { ChatMessage } from '../../types';

export interface ChatMessageActionsSheetProps {
  visible: boolean;
  message: ChatMessage | null;
  isSentByCurrentUser: boolean;
  onDelete: (messageId: string) => Promise<void>;
  onClose: () => void;
}

export const ChatMessageActionsSheet: React.FC<ChatMessageActionsSheetProps> = ({
  visible,
  message,
  isSentByCurrentUser,
  onDelete,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const handleCopy = useCallback(async () => {
    if (message) {
      await Clipboard.setStringAsync(message.text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  }, [message, onClose]);

  const handleDelete = useCallback(async () => {
    if (message) {
      await onDelete(message.id);
    }
    onClose();
  }, [message, onDelete, onClose]);

  if (!visible || !message) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: subtleBg }]} />

          {/* Copy Option */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              handleCopy();
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuLabel, { color: Colors.text }]}>Copy</Text>
          </TouchableOpacity>

          {/* Delete Option - only if sent by current user */}
          {isSentByCurrentUser && (
            <TouchableOpacity
              style={[
                styles.menuRow, styles.menuRowLast]}
              onPress={() => {
                handleDelete();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuLabel, { color: Colors.error }]}>Delete</Text>
            </TouchableOpacity>
          )}

          {!isSentByCurrentUser && <View style={styles.menuRowLast} />}

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelRow, { backgroundColor: subtleBg }]}
            onPress={() => {
              
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.cancelLabel, { color: Colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  menuRow: {
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuRowLast: {
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
  cancelRow: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default ChatMessageActionsSheet;
