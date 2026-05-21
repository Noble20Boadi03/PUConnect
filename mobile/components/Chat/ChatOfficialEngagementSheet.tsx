import React, { useMemo } from 'react';
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
import type { ChatPostContext, MarketPostTag } from '../../types';

const REQUEST_ACCENT = '#F59E0B';

export interface ChatOfficialEngagementSheetProps {
  visible: boolean;
  context: ChatPostContext;
  /** Service provider or request poster shown in the summary. */
  contactName: string;
  onConfirm: () => void;
  onClose: () => void;
}

function copyForTag(tag: MarketPostTag) {
  if (tag === 'Request') {
    return {
      badgeLabel: 'PuConnect Official Response',
      title: 'Submit Official Response',
      body: (name: string) =>
        `Submit an official response to ${name}'s request. PuConnect will track your proposal so both of you can manage the agreement in the app.`,
      summaryRole: 'Posted by',
      confirmLabel: 'Confirm Official Response',
      confirmIcon: 'hand-right-outline' as const,
    };
  }
  return {
    badgeLabel: 'PuConnect Official Request',
    title: 'Request Service',
    body: (name: string) =>
      `Start a tracked service request with ${name}. PuConnect will record this hire so both of you can manage the agreement in the app.`,
    summaryRole: 'Provider',
    confirmLabel: 'Confirm Official Request',
    confirmIcon: 'checkmark-circle-outline' as const,
  };
}

export const ChatOfficialEngagementSheet: React.FC<ChatOfficialEngagementSheetProps> = ({
  visible,
  context,
  contactName,
  onConfirm,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const isRequest = context.tag === 'Request';
  const accent = isRequest ? REQUEST_ACCENT : Colors.primary;
  const copy = useMemo(() => copyForTag(context.tag), [context.tag]);
  const confirmTextColor = isRequest
    ? '#FFFFFF'
    : isDark
      ? '#09090B'
      : '#FFFFFF';

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

          <View style={[styles.officialBadge, { backgroundColor: accent + '18' }]}>
            <Ionicons name="shield-checkmark" size={20} color={accent} />
            <Text style={[styles.officialBadgeText, { color: accent }]}>{copy.badgeLabel}</Text>
          </View>

          <Text style={[styles.title, { color: Colors.text }]}>{copy.title}</Text>
          <Text style={[styles.body, { color: Colors.icon }]}>{copy.body(contactName)}</Text>

          <View style={[styles.summaryCard, { backgroundColor: subtleBg }]}>
            <View style={styles.summaryTagRow}>
              <View style={[styles.tagPill, { backgroundColor: accent + '22' }]}>
                <Text style={[styles.tagPillText, { color: accent }]}>{context.tag}</Text>
              </View>
            </View>
            <Text style={[styles.summaryTitle, { color: Colors.text }]} numberOfLines={2}>
              {context.title}
            </Text>
            {context.priceLabel ? (
              <Text style={[styles.summaryPrice, { color: accent }]}>
                {isRequest ? `Budget · ${context.priceLabel}` : context.priceLabel}
              </Text>
            ) : null}
            <Text style={[styles.summaryProvider, { color: Colors.icon }]}>
              {copy.summaryRole} · {contactName}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: accent }]}
            onPress={handleConfirm}
            activeOpacity={0.9}
          >
            <Ionicons name={copy.confirmIcon} size={22} color={confirmTextColor} />
            <Text style={[styles.confirmLabel, { color: confirmTextColor }]}>{copy.confirmLabel}</Text>
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
  summaryTagRow: {
    flexDirection: 'row',
  },
  tagPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
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

export default ChatOfficialEngagementSheet;
