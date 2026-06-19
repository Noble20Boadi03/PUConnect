import React, { useCallback, useEffect, useState } from 'react';
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
import { ReviewPromptDialog } from '../ReviewPromptDialog';
import {
  mapDbPostToChatPostContext,
  mapServiceRequestToEngagement,
} from '../../lib/mapServiceRequest';
import { ChatOfficialDetailsCard } from '../Chat/ChatOfficialDetailsCard';
import { useServiceRequestsStore } from '../../store/serviceRequestsStore';
import { useProviderReviewsStore, selectIsEligibleForReview } from '../../store/providerReviewsStore';
import { useAuthStore } from '../../store/authStore';
import { useAppRouter } from '../../hooks';
import { buildChatHref } from '../../lib';
import type { DbServiceRequest } from '../../types/core';

const REQUEST_ACCENT = '#F59E0B';

export interface ServiceRequestDetailsViewProps {
  serviceRequest: DbServiceRequest;
  onBack: () => void;
  readOnly?: boolean;
}

export const ServiceRequestDetailsView: React.FC<ServiceRequestDetailsViewProps> = ({
  serviceRequest,
  onBack,
  readOnly = false,
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
  const { transition, accept, decline } = useServiceRequestsStore();
  const [actionLoading, setActionLoading] = useState(false);

  const [reviewPromptVisible, setReviewPromptVisible] = useState(false);
  const [pendingReviewDealId, setPendingReviewDealId] = useState<string | null>(null);
  const recordCompletedDeal = useProviderReviewsStore((s) => s.recordCompletedDeal);
  const dismissReviewPrompt = useProviderReviewsStore((s) => s.dismissReviewPrompt);
  const eligibleReviews = useProviderReviewsStore((s) => s.eligibleReviews);
  const fetchEligibleReviews = useProviderReviewsStore((s) => s.fetchEligibleReviews);

  const authUserId = useAuthStore((state) => state.user?.id);
  
  // Subscribe to live store updates for this specific request
  const liveServiceRequest = useServiceRequestsStore(
    (state) => state.requests.find((r) => r.id === serviceRequest.id)
  );
  const activeRequest = liveServiceRequest ?? serviceRequest;

  const engagement = mapServiceRequestToEngagement(activeRequest);
  const postContext = activeRequest.post
    ? mapDbPostToChatPostContext(activeRequest.post)
    : null;
  const isRequester = activeRequest.requesterId === authUserId;
  
  const isEligibleForReview = isRequester && selectIsEligibleForReview(eligibleReviews, activeRequest.id);
  
  // Fetch eligible reviews on mount
  useEffect(() => {
    fetchEligibleReviews();
  }, [fetchEligibleReviews]);
  const peer = isRequester ? activeRequest.provider : activeRequest.requester;
  const contactName = peer?.name ?? 'Unknown';
  const isRequest = postContext?.tag === 'Request';
  const accent = isRequest ? REQUEST_ACCENT : Colors.primary;
  const userIsProvider = activeRequest.providerId === authUserId;
  const userIsRequester = activeRequest.requesterId === authUserId;
  const isResponseKind = activeRequest.kind === 'response';

  const canRequestCompletion =
    engagement.officialEngagementStatus === 'active' &&
    engagement.completionPhase === 'none' &&
    userIsProvider;
  const canReviewCompletion =
    engagement.officialEngagementStatus === 'active' &&
    engagement.completionPhase === 'pending_review' &&
    !userIsProvider;
  const canAccept = engagement.officialEngagementStatus === 'pending' && (
    (isResponseKind && userIsRequester) || (!isResponseKind && userIsProvider)
  );
  const canDecline = engagement.officialEngagementStatus === 'pending' && (
    (isResponseKind && userIsRequester) || (!isResponseKind && userIsProvider)
  );

  const handleOpenPost = useCallback(async () => {
    if (!postContext || actionLoading) return;
    setActionLoading(true);
    try {

      router.push(`/post/${postContext.postId}` as any);
    } catch (err) {
      console.error('Failed to open post:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [postContext, router, actionLoading]);

  const handleOpenChat = useCallback(async () => {
    if (!peer?.username || actionLoading) return;
    setActionLoading(true);
    try {

      const href = postContext
        ? buildChatHref(peer.username, postContext.postId)
        : buildChatHref(peer.username);
      router.push(href as any);
    } catch (err) {
      console.error('Failed to open chat:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [peer, postContext, router, actionLoading]);

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
      await transition(activeRequest.id, 'cancel');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) {
      console.error('Failed to cancel request:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [postContext, actionLoading, showConfirm, transition, activeRequest.id]);

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
      await transition(activeRequest.id, 'withdraw');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) {
      console.error('Failed to withdraw response:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [postContext, actionLoading, showConfirm, transition, activeRequest.id]);

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
      await transition(activeRequest.id, 'request_completion');

    } catch (err) {
      console.error('Failed to request completion:', err);
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
    activeRequest.id,
  ]);

  const promptOptionalReview = useCallback(
    (dealId: string) => {
      setPendingReviewDealId(dealId);
      setReviewPromptVisible(true);
    },
    []
  );

  const completeUndertakingAsClient = useCallback(
    (ctx: NonNullable<typeof postContext>) => {
      if (!peer?.username) return;
      const dealId = recordCompletedDeal({
        id: activeRequest.id,
        revieweeUsername: peer.username,
        postId: ctx.postId,
        postTitle: ctx.title,
        completedAt: new Date().toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        serviceRequestId: activeRequest.id,
      });
      promptOptionalReview(dealId);
    },
    [activeRequest.id, peer?.username, recordCompletedDeal, promptOptionalReview]
  );

  const handleReviewNow = useCallback(() => {
    if (!postContext || !peer?.username) return;
    setReviewPromptVisible(false);
    const query = activeRequest.id
      ? `postId=${encodeURIComponent(postContext.postId)}&serviceRequestId=${encodeURIComponent(activeRequest.id)}`
      : `postId=${encodeURIComponent(postContext.postId)}`;
    router.push(`/provider/${peer.username}/review?${query}` as any);
  }, [postContext, peer?.username, activeRequest.id, router]);

  const handleReviewLater = useCallback(() => {
    if (pendingReviewDealId) {
      dismissReviewPrompt(pendingReviewDealId);
    }
    setReviewPromptVisible(false);
    setPendingReviewDealId(null);
  }, [pendingReviewDealId, dismissReviewPrompt]);

  const handleLeaveReview = useCallback(() => {
    if (!postContext || !peer?.username) return;
    const query = activeRequest.id
      ? `postId=${encodeURIComponent(postContext.postId)}&serviceRequestId=${encodeURIComponent(activeRequest.id)}`
      : `postId=${encodeURIComponent(postContext.postId)}`;
    router.push(`/provider/${peer.username}/review?${query}` as any);
  }, [postContext, peer?.username, activeRequest.id, router]);

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
      await transition(activeRequest.id, 'confirm_completion');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeUndertakingAsClient(ctx);
    } catch (err) {
      console.error('Failed to confirm completion:', err);
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
    activeRequest.id,
    completeUndertakingAsClient,
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
      await transition(activeRequest.id, 'decline_completion');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) {
      console.error('Failed to decline completion:', err);
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
    activeRequest.id,
  ]);

  const handleAccept = useCallback(async () => {
    if (!postContext || actionLoading || !canAccept) return;
    const ctx = postContext;
    const title = isResponseKind ? 'Accept Response?' : 'Accept Request?';
    const message = isResponseKind 
      ? `Accept this official response for "${ctx.title}"? This will start the service engagement.` 
      : `Accept this official request for "${ctx.title}"? This will start the service engagement.`;
    const confirmed = await showConfirm({
      title,
      message,
      confirmLabel: 'Accept',
      cancelLabel: 'Cancel',
      icon: 'checkmark-circle-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await accept(activeRequest.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Failed to accept request:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [postContext, actionLoading, canAccept, showConfirm, accept, activeRequest.id, isResponseKind]);

  const handleDecline = useCallback(async () => {
    if (!postContext || actionLoading || !canDecline) return;
    const ctx = postContext;
    const title = isResponseKind ? 'Decline Response?' : 'Decline Request?';
    const message = isResponseKind 
      ? `Decline this official response for "${ctx.title}"? The provider will be notified.` 
      : `Decline this official request for "${ctx.title}"? The requester will be notified.`;
    const confirmed = await showConfirm({
      title,
      message,
      confirmLabel: 'Decline',
      cancelLabel: 'Cancel',
      variant: 'destructive',
      icon: 'close-circle-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await decline(activeRequest.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) {
      console.error('Failed to decline request:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [postContext, actionLoading, canDecline, showConfirm, decline, activeRequest.id, isResponseKind]);

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
        {readOnly && (
          <View style={[styles.infoBlock, { backgroundColor: Colors.primary + '15', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
            <Ionicons name="eye-outline" size={24} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: Colors.primary }]}>This is a past service</Text>
              <Text style={[styles.infoBody, { color: Colors.icon }]}>No actions available.</Text>
            </View>
          </View>
        )}
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
              currentUserId={authUserId ?? ''}
              serviceRequest={activeRequest}
            />
          </View>
        )}

        {engagement.officialEngagementStatus === 'pending' && !canAccept && !canDecline && (
          <View style={[styles.infoBlock, { backgroundColor: subtleBg }]}>
            <Text style={[styles.infoTitle, { color: Colors.text }]}>
              {isResponseKind ? 'Waiting for client to accept' : 'Waiting for provider to accept'}
            </Text>
            <Text style={[styles.infoBody, { color: Colors.icon }]}>
              {isResponseKind 
                ? `The client has been notified and will review your response for "${postContext?.title}".` 
                : `The provider has been notified and will review your request for "${postContext?.title}".`
              }
            </Text>
          </View>
        )}

        {engagement.officialEngagementStatus === 'declined' && (
          <View style={[styles.infoBlock, { backgroundColor: Colors.error + '15' }]}>
            <Text style={[styles.infoTitle, { color: Colors.error }]}>
              Request declined
            </Text>
            <Text style={[styles.infoBody, { color: Colors.icon }]}>
              The provider has declined this request. You can continue chatting or create a new request.
            </Text>
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
              service was delivered as agreed for "{postContext?.title}".
            </Text>
          </View>
        )}

        {isEligibleForReview && (
          <View style={[styles.infoBlock, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="star-outline" size={24} color={Colors.primary} />
            <Text style={[styles.infoTitle, { color: Colors.primary }]}>
              Leave a review
            </Text>
            <Text style={[styles.infoBody, { color: Colors.icon }]}>
              Help {contactName} by sharing your experience with "{postContext?.title}".
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}>
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

        {!readOnly && (
          <>
            {actionLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <>
                {canAccept && (
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: accent }]}
                    onPress={handleAccept}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
                    <Text style={styles.primaryLabel}>Accept</Text>
                  </TouchableOpacity>
                )}

                {canDecline && (
                  <TouchableOpacity
                    style={[styles.destructiveButton, { backgroundColor: Colors.error + '15' }]}
                    onPress={handleDecline}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.destructiveLabel, { color: Colors.error }]}>
                      Decline
                    </Text>
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

                {isEligibleForReview && (
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
                    onPress={handleLeaveReview}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="star-outline" size={22} color="#FFFFFF" />
                    <Text style={styles.primaryLabel}>Leave a Review</Text>
                  </TouchableOpacity>
                )}

                {(engagement.officialEngagementStatus === 'active' || engagement.officialEngagementStatus === 'pending') &&
                  engagement.completionPhase === 'none' && (
                    <>
                      {isRequester && (
                        <TouchableOpacity
                          style={[styles.destructiveButton, { backgroundColor: Colors.error + '15' }]}
                          onPress={handleCancelOfficialRequest}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.destructiveLabel, { color: Colors.error }]}>
                            Cancel Request
                          </Text>
                        </TouchableOpacity>
                      )}
                      {userIsProvider && engagement.officialEngagementStatus === 'active' && (
                        <TouchableOpacity
                          style={[styles.destructiveButton, { backgroundColor: Colors.error + '15' }]}
                          onPress={handleWithdrawOfficialResponse}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.destructiveLabel, { color: Colors.error }]}>
                            {postContext?.tag === 'Service' ? 'Decline Request' : 'Withdraw Response'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
              </>
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

      <ReviewPromptDialog
        visible={reviewPromptVisible}
        providerName={peer?.name ?? 'the provider'}
        serviceTitle={postContext?.title ?? 'this service'}
        onReviewNow={handleReviewNow}
        onLater={handleReviewLater}
      />
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
