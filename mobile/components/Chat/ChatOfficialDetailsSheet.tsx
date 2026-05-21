import React from 'react';
import {
  Modal,
  ScrollView,
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
import { isCurrentUserProvider } from '../../lib/officialEngagement';
import { ChatOfficialDetailsCard } from './ChatOfficialDetailsCard';
import type {
  ChatPostContext,
  OfficialCompletionPhase,
  OfficialEngagementStatus,
} from '../../types';

const REQUEST_ACCENT = '#F59E0B';

export interface ChatOfficialDetailsSheetProps {
  visible: boolean;
  context: ChatPostContext;
  contactName: string;
  engagementStatus: OfficialEngagementStatus;
  completionPhase: OfficialCompletionPhase;
  startedAt?: string;
  completionRequestedAt?: string;
  onRequestCompletion?: () => void;
  onConfirmCompletion?: () => void;
  onDeclineCompletion?: () => void;
  onOpenPost?: () => void;
  onClose: () => void;
}

export const ChatOfficialDetailsSheet: React.FC<ChatOfficialDetailsSheetProps> = ({
  visible,
  context,
  contactName,
  engagementStatus,
  completionPhase,
  startedAt,
  completionRequestedAt,
  onRequestCompletion,
  onConfirmCompletion,
  onDeclineCompletion,
  onOpenPost,
  onClose,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const isRequest = context.tag === 'Request';
  const accent = isRequest ? REQUEST_ACCENT : Colors.primary;
  const userIsProvider = isCurrentUserProvider(context.tag);
  const canRequestCompletion =
    engagementStatus === 'active' &&
    completionPhase === 'none' &&
    userIsProvider &&
    onRequestCompletion;
  const canReviewCompletion =
    engagementStatus === 'active' &&
    completionPhase === 'pending_review' &&
    !userIsProvider &&
    onConfirmCompletion &&
    onDeclineCompletion;

  const handleRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRequestCompletion?.();
    onClose();
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirmCompletion?.();
    onClose();
  };

  const handleDecline = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDeclineCompletion?.();
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

          <Text style={[styles.sheetTitle, { color: Colors.text }]}>Official Details</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <ChatOfficialDetailsCard
              context={context}
              contactName={contactName}
              engagementStatus={engagementStatus}
              completionPhase={completionPhase}
              startedAt={startedAt}
              completionRequestedAt={completionRequestedAt}
              textColor={Colors.text}
              mutedColor={Colors.icon}
              subtleBg={subtleBg}
              primaryColor={Colors.primary}
            />

            {canReviewCompletion ? (
              <View style={[styles.reviewBlock, { backgroundColor: subtleBg }]}>
                <Text style={[styles.reviewTitle, { color: Colors.text }]}>
                  Review service delivered
                </Text>
                <Text style={[styles.reviewBody, { color: Colors.icon }]}>
                  {contactName} has requested to close this undertaking. Confirm only if the
                  service was delivered as agreed for “{context.title}”.
                </Text>
              </View>
            ) : null}

            {engagementStatus === 'active' && completionPhase === 'pending_review' && userIsProvider ? (
              <View style={[styles.reviewBlock, { backgroundColor: subtleBg }]}>
                <Text style={[styles.reviewTitle, { color: Colors.text }]}>
                  Awaiting client confirmation
                </Text>
                <Text style={[styles.reviewBody, { color: Colors.icon }]}>
                  You requested completion. {contactName} must review the service delivered before
                  this undertaking is marked complete.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {onOpenPost ? (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: subtleBg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpenPost();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="open-outline" size={18} color={Colors.text} />
              <Text style={[styles.secondaryLabel, { color: Colors.text }]}>View Listing</Text>
            </TouchableOpacity>
          ) : null}

          {canRequestCompletion ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: accent }]}
              onPress={handleRequest}
              activeOpacity={0.9}
            >
              <Ionicons name="checkmark-done-outline" size={22} color="#FFFFFF" />
              <Text style={styles.primaryLabel}>Request Completion</Text>
            </TouchableOpacity>
          ) : null}

          {canReviewCompletion ? (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: accent }]}
                onPress={handleConfirm}
                activeOpacity={0.9}
              >
                <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
                <Text style={styles.primaryLabel}>Confirm Service Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.declineRow, { backgroundColor: subtleBg }]}
                onPress={handleDecline}
                activeOpacity={0.85}
              >
                <Text style={[styles.declineLabel, { color: Colors.error }]}>
                  Not Yet — Needs More Work
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            style={[styles.cancelRow, { backgroundColor: subtleBg }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.cancelLabel, { color: Colors.text }]}>Close</Text>
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
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  reviewBlock: {
    borderRadius: 14,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  reviewTitle: {
    fontSize: Typography.size.md,
    fontWeight: '800',
  },
  reviewBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    marginTop: Spacing.sm,
  },
  secondaryLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    marginTop: Spacing.sm,
  },
  primaryLabel: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  declineRow: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  declineLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  cancelRow: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cancelLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default ChatOfficialDetailsSheet;
