import React from 'react';
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
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

export type ChatMenuAction = 'requestService' | 'mute' | 'report' | 'cancel';

export interface ChatOptionsSheetProps {
  visible: boolean;
  onSelect: (action: ChatMenuAction) => void;
  onClose: () => void;
}

const MENU_ITEMS: { key: Exclude<ChatMenuAction, 'cancel'>; label: string; destructive?: boolean }[] =
  [
    { key: 'requestService', label: 'Request Service' },
    { key: 'mute', label: 'Mute' },
    { key: 'report', label: 'Report', destructive: true },
  ];

export const ChatOptionsSheet: React.FC<ChatOptionsSheetProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const handlePress = (action: ChatMenuAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === 'report') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    onSelect(action);
    onClose();
  };

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
            { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: subtleBg }]} />

          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuRow,
                index < MENU_ITEMS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: subtleBg,
                },
              ]}
              onPress={() => handlePress(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.menuLabel,
                  { color: item.destructive ? Colors.error : Colors.text },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.cancelRow, { backgroundColor: subtleBg }]}
            onPress={() => handlePress('cancel')}
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

export default ChatOptionsSheet;
