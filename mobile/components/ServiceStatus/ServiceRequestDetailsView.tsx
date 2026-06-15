import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Spacing, Typography } from '../../constants';
import { useThemeColor, useConfirmDialog } from '../../hooks';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  mapDbPostToChatPostContext,
  mapServiceRequestToEngagement,
} from '../../lib/mapServiceRequest';
import { isCurrentUserProvider } from '../../lib/officialEngagement';
import { ChatOfficialDetailsCard } from '../Chat/ChatOfficialDetailsCard';
import { useServiceRequestsStore } from '../../store/serviceRequestsStore';
import { useAuthStore } from '../../store/authStore';
import { useAppRouter } from '../../hooks';
import { buildChatHref } from '../../lib';
import type { DbServiceRequest } from '../../types/core';

const REQUEST_ACCENT = '#F59E0B';

export interface ServiceRequestDetailsViewProps {
  serviceRequest: DbServiceRequest;
  onBack: () => void;
}

export const ServiceRequestDetailsView: React.FC<ServiceRequestDetailsViewProps> = ({
  serviceRequest,
  onBack,
}) => {
  const Colors = useThemeColor();
  const router = useAppRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const { showConfirm, confirmVisible, confirmOptions, handleConfirm, handleCancel } =
    useConfirmDialog();
  const { transition } = useServiceRequestsStore();
  const [actionLoading, setActionLoading] = useState(false);

  const authUserId = useAuthStore((state) => state.user?.id);

  const engagement = mapServiceRequestToEngagement(serviceRequest);
  const postContext = serviceRequest.post
    ? mapDbPostToChatPostContext(serviceRequest.post)
    : null;
  const isRequester = serviceRequest.requesterId === authUserId;
  const peer = isRequester ? serviceRequest.provider : serviceRequest.requester;
  const contactName = peer?.name ?? 'Unknown';
  const isRequest = postContext?.tag === 'Request';
  const accent = isRequest ? REQUEST_ACCENT : Colors.primary;
  const userIsProvider = postContext ? isCurrentUserProvider(postContext.tag) : false;

  const canRequestCompletion =
    engagement.officialEngagementStatus === 'active' &&
    engagement.completionPhase === 'none' &&
    userIsProvider;
  const canReviewCompletion =
    engagement.officialEngagementStatus === 'active' &&
    engagement.completionPhase === 'pending_review' &&
    !userIsProvider;

  const handleOpenPost = useCallback(() => {
    if (!postContext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/post/${postContext.postId}` as any);
  }, [postContext, router]);

  const handleOpenChat = useCallback(() => {
    if (!peer?.username) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const href = postContext
      ? buildChatHref(peer.username, postContext.postId)
      : buildChatHref(peer.username);
    router.push(href as any);
  }, [peer, postContext, router]);

  const handleCancelOfficialRequest = useCallback(async () => {
    if (!postContext || actionLoading) return;
    const ctx = postContext;
    const confirmed = await showConfirm({
      title: 'Cancel Official Request?',
      message: `This withdraws your official request for “${ctx.title}”. You can start a new official request later if needed.`,
      confirmLabel: 'Cancel Request',
      cancelLabel: 'Keep Request',
      variant: 'destructive',
      icon: 'close-circle-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await transition(serviceRequest.id, 'cancel');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [postContext, actionLoading, showConfirm, transition, serviceRequest.id]);

  const handleWithdrawOfficialResponse = useCallback(async () => {
    if (!postContext || actionLoading) return;
    const ctx = postContext;
    const confirmed = await showConfirm({
      title: 'Withdraw Official Response?',
      message: `This removes your official response to “${ctx.title}”. You can submit a new official response later if needed.`,
      confirmLabel: 'Withdraw',
      cancelLabel: 'Keep Response',
      variant: 'destructive',
      icon: 'arrow-undo-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await transition(serviceRequest.id, 'withdraw');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [postContext, actionLoading, showConfirm, transition, serviceRequest.id]);

  const handleRequestOfficialCompletion = useCallback(async () => {
    if (
      !postContext ||
      engagement.officialEngagementStatus !== 'active' ||
      engagement.completionPhase !== 'none' ||
      !userIsProvider ||
      actionLoading
    ) {
      return;
    }
    const ctx = postContext;
    const confirmed = await showConfirm({
      title: 'Request Completion?',
      message: `Notify ${contactName} that the service for “${ctx.title}” is ready for review. They must confirm before this undertaking is closed.`,
      confirmLabel: 'Request Completion',
      cancelLabel: 'Not Yet',
      icon: 'checkmark-done-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await transition(serviceRequest.id, 'request_completion');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [
    postContext,
    contactName,
    engagement,
    userIsProvider,
    actionLoading,
    showConfirm,
    transition,
    serviceRequest.id,
  ]);

  const handleConfirmOfficialCompletion = useCallback(async () => {
    if (
      !postContext ||
      engagement.completionPhase !== 'pending_review' ||
      userIsProvider ||
      actionLoading
    ) {
      return;
    }
    const ctx = postContext;
    const confirmed = await showConfirm({
      title: 'Confirm Service Delivered?',
      message: `Both parties must agree to close this undertaking for “${ctx.title}”. Only confirm if the service met what was agreed.`,
      confirmLabel: 'Confirm Complete',
      cancelLabel: 'Cancel',
      icon: 'checkmark-circle-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await transition(serviceRequest.id, 'confirm_completion');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [
    postContext,
    engagement,
    userIsProvider,
    actionLoading,
    showConfirm,
    transition,
    serviceRequest.id,
  ]);

  const handleDeclineOfficialCompletion = useCallback(async () => {
    if (
      !postContext ||
      engagement.completionPhase !== 'pending_review' ||
      userIsProvider ||
      actionLoading
    ) {
      return;
    }
    const ctx = postContext;
    const confirmed = await showConfirm({
      title: 'Needs More Work?',
      message: `Decline completion for now and let ${contactName} know the service for “${ctx.title}” still needs attention.`,
      confirmLabel: 'Decline for Now',
      cancelLabel: 'Cancel',
      variant: 'destructive',
      icon: 'alert-circle-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await transition(serviceRequest.id, 'decline_completion');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [
    postContext,
    contactName,
    engagement,
    userIsProvider,
    actionLoading,
    showConfirm,
    transition,
    serviceRequest.id,
  ]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Service Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {postContext && (
          <View style={styles.cardContainer}>
            <ChatOfficialDetailsCard
              context={postContext}
              contactName={contactName}
              engagementStatus={engagement.officialEngagementStatus}
              completionPhase={engagement.completionPhase}
              startedAt={engagement.startedAt}
              completionRequestedAt={engagement.completionRequestedAt}
              textColor={Colors.text}
              mutedColor={Colors.icon}
              subtleBg={subtleBg}
              primaryColor={Colors.primary}
            />
          </View>
        )}

        {engagement.completionPhase === 'pending_review' && userIsProvider && (
          <View style={[styles.infoBlock, { backgroundColor: subtleBg }]}>
            <Text style={[styles.infoTitle, { color: Colors.text }]}>
              Awaiting client confirmation
            </Text>
            <Text style={[styles.infoBody, { color: Colors.icon }]}>
              You requested completion. {contactName} must review the service delivered before
              this undertaking is marked complete.
            </Text>
          </View>
        )}

        {canReviewCompletion && (
          <View style={[styles.infoBlock, { backgroundColor: subtleBg }]}>
            <Text style={[styles.infoTitle, { color: Colors.text }]}>
              Review service delivered
            </Text>
            <Text style={[styles.infoBody, { color: Colors.icon }]}>
              {contactName} has requested to close this undertaking. Confirm only if the
              service was delivered as agreed for “{postContext?.title}”.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}>
        {actionLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            {postContext && (
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: subtleBg }]}
                onPress={handleOpenPost}
                activeOpacity={0.85}
              >
                <Ionicons name="open-outline" size={18} color={Colors.text} />
                <Text style={[styles.secondaryLabel, { color: Colors.text }]}>View Listing</Text>
              </TouchableOpacity>
            )}

            {peer?.username && (
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: subtleBg }]}
                onPress={handleOpenChat}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble-outline" size={18} color={Colors.text} />
                <Text style={[styles.secondaryLabel, { color: Colors.text }]}>Open Chat</Text>
              </TouchableOpacity>
            )}

            {canRequestCompletion && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: accent }]}
                onPress={handleRequestOfficialCompletion}
                activeOpacity={0.9}
              >
                <Ionicons name="checkmark-done-outline" size={22} color="#FFFFFF" />
                <Text style={styles.primaryLabel}>Request Completion</Text>
              </TouchableOpacity>
            )}

            {canReviewCompletion && (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: accent }]}
                  onPress={handleConfirmOfficialCompletion}
                  activeOpacity={0.9}
                >
                  <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.primaryLabel}>Confirm Service Delivered</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.declineButton, { backgroundColor: subtleBg }]}
                  onPress={handleDeclineOfficialCompletion}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.declineLabel, { color: Colors.error }]}>
                    Needs More Work
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {(isRequest ? isRequester : userIsProvider) &&
              engagement.officialEngagementStatus === 'active' &&
              engagement.completionPhase === 'none' && (
                <TouchableOpacity
                  style={[styles.destructiveButton, { backgroundColor: Colors.error + '15' }]}
                  onPress={
                    isRequest && isRequester
                      ? handleCancelOfficialRequest
                      : handleWithdrawOfficialResponse
                  }
                  activeOpacity={0.85}
                >
                  <Text style={[styles.destructiveLabel, { color: Colors.error }]}>
                    {isRequest && isRequester ? 'Cancel Request' : 'Withdraw Response'}
                  </Text>
                </TouchableOpacity>
              )}
          </>
        )}
      </View>

      {confirmOptions && (
        <ConfirmDialog
          visible={confirmVisible}
          title={confirmOptions.title}
          message={confirmOptions.message}
          confirmLabel={confirmOptions.confirmLabel}
          cancelLabel={confirmOptions.cancelLabel}
          variant={confirmOptions.variant}
          icon={confirmOptions.icon}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  cardContainer: {
    marginBottom: Spacing.sm,
  },
  infoBlock: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  infoTitle: {
    fontSize: Typography.size.md,
    fontWeight: '800',
  },
  infoBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
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
  },
  primaryLabel: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  declineButton: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  declineLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  destructiveButton: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  destructiveLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default ServiceRequestDetailsView;
