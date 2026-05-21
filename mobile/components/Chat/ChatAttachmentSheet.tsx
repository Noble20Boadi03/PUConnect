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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

export type ChatAttachmentAction = 'photos' | 'documents' | 'cancel';

export interface ChatAttachmentSheetProps {
  visible: boolean;
  onSelect: (action: ChatAttachmentAction) => void;
  onClose: () => void;
}

const ATTACH_ITEMS: {
  key: Exclude<ChatAttachmentAction, 'cancel'>;
  label: string;
  icon: 'images-outline' | 'document-text-outline';
  subtitle: string;
}[] = [
  {
    key: 'photos',
    label: 'Photos',
    icon: 'images-outline',
    subtitle: 'Share from your gallery',
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: 'document-text-outline',
    subtitle: 'PDF, Word, and other files',
  },
];

export const ChatAttachmentSheet: React.FC<ChatAttachmentSheetProps> = ({
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

  const handlePress = (action: ChatAttachmentAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          <Text style={[styles.sheetTitle, { color: Colors.text }]}>Attach</Text>

          {ATTACH_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.optionRow, { backgroundColor: subtleBg }]}
              onPress={() => handlePress(item.key)}
              activeOpacity={0.85}
            >
              <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '18' }]}>
                <Ionicons name={item.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: Colors.text }]}>{item.label}</Text>
                <Text style={[styles.optionSubtitle, { color: Colors.icon }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.icon} />
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
    gap: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  cancelRow: {
    marginTop: Spacing.sm,
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

export default ChatAttachmentSheet;
