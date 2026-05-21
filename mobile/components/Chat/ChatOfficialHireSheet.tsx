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
import type { ChatPostContext } from '../../types';

export interface ChatOfficialHireSheetProps {
  visible: boolean;
  context: ChatPostContext;
  providerName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ChatOfficialHireSheet: React.FC<ChatOfficialHireSheetProps> = ({
  visible,
  context,
  providerName,
  onConfirm,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
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

          <View style={[styles.officialBadge, { backgroundColor: Colors.primary + '18' }]}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={[styles.officialBadgeText, { color: Colors.primary }]}>
              PuConnect Official Request
            </Text>
          </View>

          <Text style={[styles.title, { color: Colors.text }]}>Request Service</Text>
          <Text style={[styles.body, { color: Colors.icon }]}>
            Start a tracked service request with {providerName}. PuConnect will record this hire
            so both of you can manage the agreement in the app.
          </Text>

          <View style={[styles.summaryCard, { backgroundColor: subtleBg }]}>
            <Text style={[styles.summaryTitle, { color: Colors.text }]} numberOfLines={2}>
              {context.title}
            </Text>
            {context.priceLabel ? (
              <Text style={[styles.summaryPrice, { color: Colors.primary }]}>
                {context.priceLabel}
              </Text>
            ) : null}
            <Text style={[styles.summaryProvider, { color: Colors.icon }]}>
              Provider · {providerName}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: Colors.primary }]}
            onPress={handleConfirm}
            activeOpacity={0.9}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={isDark ? '#09090B' : '#FFFFFF'}
            />
            <Text style={[styles.confirmLabel, { color: isDark ? '#09090B' : '#FFFFFF' }]}>
              Confirm Official Request
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelRow, { backgroundColor: subtleBg }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    gap: Spacing.sm + 2,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  officialBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: Spacing.sm,
  },
  summaryCard: {
    borderRadius: 14,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  summaryTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  summaryPrice: {
    fontSize: Typography.size.sm,
    fontWeight: '800',
  },
  summaryProvider: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    marginTop: Spacing.xs,
  },
  confirmLabel: {
    fontSize: Typography.size.md,
    fontWeight: '800',
  },
  cancelRow: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cancelLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default ChatOfficialHireSheet;
