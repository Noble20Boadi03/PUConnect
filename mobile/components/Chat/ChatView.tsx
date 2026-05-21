import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ConfirmDialog } from '../ConfirmDialog';
import { ReviewPromptDialog } from '../ReviewPromptDialog';
import { useConfirmDialog, useThemeColor } from '../../hooks';
import { useProviderReviewsStore } from '../../store/providerReviewsStore';
import { Spacing, Typography } from '../../constants';
import { getProviderServices, isCurrentUserProvider } from '../../lib';
import { ChatHeader } from './ChatHeader';
import { ChatContextBanner } from './ChatContextBanner';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatComposer } from './ChatComposer';
import { ChatOptionsSheet, type ChatMenuAction } from './ChatOptionsSheet';
import { ChatAttachmentSheet, type ChatAttachmentAction } from './ChatAttachmentSheet';
import { ChatOfficialEngagementSheet } from './ChatOfficialEngagementSheet';
import { ChatOfficialDetailsSheet } from './ChatOfficialDetailsSheet';
import { ProviderServicesSheet } from './ProviderServicesSheet';
import type {
  ChatDateGroup,
  ChatMessage,
  ChatThread,
  OfficialCompletionPhase,
  OfficialEngagementStatus,
} from '../../types';

const REQUEST_ACCENT = '#F59E0B';

function formatSentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDisplayDate(): string {
  return new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function appendMessages(groups: ChatDateGroup[], messages: ChatMessage[]): ChatDateGroup[] {
  if (messages.length === 0) return groups;

  const next = groups.map((g) => ({ ...g, messages: [...g.messages] }));
  const lastGroup = next[next.length - 1];

  if (lastGroup) {
    lastGroup.messages.push(...messages);
    return next;
  }

  return [{ dateLabel: 'TODAY', messages: [...messages] }];
}

function appendSentMessage(groups: ChatDateGroup[], text: string): ChatDateGroup[] {
  const trimmed = text.trim();
  if (!trimmed) return groups;

  const next = groups.map((g) => ({ ...g, messages: [...g.messages] }));
  const lastGroup = next[next.length - 1];
  const newMessage = {
    id: `local-${Date.now()}`,
    kind: 'sent' as const,
    text: trimmed,
    time: formatSentTime(),
  };

  if (lastGroup) {
    lastGroup.messages.push(newMessage);
    return next;
  }

  return [
    {
      dateLabel: 'TODAY',
      messages: [newMessage],
    },
  ];
}

export interface ChatViewProps {
  thread: ChatThread;
  onBack: () => void;
  onOpenPost?: (postId: string) => void;
  /** Post detail from request-service picker (no profile, request CTA). */
  onOpenPostForRequest?: (postId: string) => void;
  /** Opens `/provider/{slug}` — same route as service post detail. */
  onViewProviderProfile?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  thread,
  onBack,
  onOpenPost,
  onOpenPostForRequest,
  onViewProviderProfile,
}) => {
  const router = useRouter();
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const {
    showConfirm,
    confirmVisible,
    confirmOptions,
    handleConfirm: handleConfirmDialog,
    handleCancel: handleCancelDialog,
  } = useConfirmDialog();
  const recordCompletedDeal = useProviderReviewsStore((s) => s.recordCompletedDeal);
  const dismissReviewPrompt = useProviderReviewsStore((s) => s.dismissReviewPrompt);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const sentBg = Colors.primary;
  const sentText = isDark ? '#09090B' : '#FFFFFF';

  const [draft, setDraft] = useState('');
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [servicesVisible, setServicesVisible] = useState(false);
  const [engagementSheetVisible, setEngagementSheetVisible] = useState(false);
  const [detailsSheetVisible, setDetailsSheetVisible] = useState(false);
  const [officialEngagementStatus, setOfficialEngagementStatus] =
    useState<OfficialEngagementStatus>('none');
  const [completionPhase, setCompletionPhase] = useState<OfficialCompletionPhase>('none');
  const [engagementStartedAt, setEngagementStartedAt] = useState<string | undefined>();
  const [completionRequestedAt, setCompletionRequestedAt] = useState<string | undefined>();
  const [reviewPromptVisible, setReviewPromptVisible] = useState(false);
  const [pendingReviewDealId, setPendingReviewDealId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [dateGroups, setDateGroups] = useState<ChatDateGroup[]>(() =>
    thread.dateGroups.map((g) => ({ ...g, messages: [...g.messages] }))
  );

  const providerServices = useMemo(
    () => getProviderServices(thread.providerUsername),
    [thread.providerUsername]
  );

  const handleOpenPost = useCallback(() => {
    if (!thread.postContext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenPost?.(thread.postContext.postId);
  }, [thread.postContext, onOpenPost]);

  const handleMoreOptions = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOptionsVisible(true);
  }, []);

  const canOfficialService =
    thread.postContext?.tag === 'Service' && officialEngagementStatus === 'none';
  const canOfficialRequest =
    thread.postContext?.tag === 'Request' && officialEngagementStatus === 'none';
  const showViewProviderProfile =
    !thread.postContext || thread.postContext.tag === 'Service';
  const hasOfficialEngagement =
    officialEngagementStatus === 'active' || officialEngagementStatus === 'completed';

  const userIsProvider = thread.postContext
    ? isCurrentUserProvider(thread.postContext.tag)
    : false;

  const contextAccent =
    thread.postContext?.tag === 'Request' ? REQUEST_ACCENT : Colors.primary;

  const openOfficialDetails = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailsSheetVisible(true);
  }, []);

  const handleContextBannerPress = useCallback(() => {
    if (hasOfficialEngagement) {
      openOfficialDetails();
      return;
    }
    handleOpenPost();
  }, [hasOfficialEngagement, openOfficialDetails, handleOpenPost]);

  const appendEngagementSystemMessages = useCallback(
    (messages: ChatMessage[]) => {
      setDateGroups((prev) => appendMessages(prev, messages));
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    },
    []
  );

  const promptOptionalReview = useCallback(
    (dealId: string) => {
      setPendingReviewDealId(dealId);
      setReviewPromptVisible(true);
    },
    []
  );

  const handleCancelOfficialRequest = useCallback(async () => {
    if (!thread.postContext) return;
    const ctx = thread.postContext;
    const confirmed = await showConfirm({
      title: 'Cancel Official Request?',
      message: `This withdraws your official request for “${ctx.title}”. You can start a new official request later if needed.`,
      confirmLabel: 'Cancel Request',
      cancelLabel: 'Keep Request',
      variant: 'destructive',
      icon: 'close-circle-outline',
    });
    if (!confirmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setOfficialEngagementStatus('none');
    setCompletionPhase('none');
    setCompletionRequestedAt(undefined);
    setEngagementStartedAt(undefined);
    appendEngagementSystemMessages([
      {
        id: `system-cancel-${Date.now()}`,
        kind: 'system',
        text: `Official service request for “${ctx.title}” was cancelled.`,
        time: formatSentTime(),
      },
    ]);
  }, [thread.postContext, showConfirm, appendEngagementSystemMessages]);

  const handleWithdrawOfficialResponse = useCallback(async () => {
    if (!thread.postContext) return;
    const ctx = thread.postContext;
    const confirmed = await showConfirm({
      title: 'Withdraw Official Response?',
      message: `This removes your official response to “${ctx.title}”. You can submit a new official response later if needed.`,
      confirmLabel: 'Withdraw',
      cancelLabel: 'Keep Response',
      variant: 'destructive',
      icon: 'arrow-undo-outline',
    });
    if (!confirmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setOfficialEngagementStatus('none');
    setCompletionPhase('none');
    setCompletionRequestedAt(undefined);
    setEngagementStartedAt(undefined);
    appendEngagementSystemMessages([
      {
        id: `system-withdraw-${Date.now()}`,
        kind: 'system',
        text: `Official response to “${ctx.title}” was withdrawn.`,
        time: formatSentTime(),
      },
    ]);
  }, [thread.postContext, showConfirm, appendEngagementSystemMessages]);

  const applyProviderCompletionRequest = useCallback(
    (ctx: NonNullable<ChatThread['postContext']>) => {
      const providerName = userIsProvider ? 'You' : thread.participant.displayName;
      const time = formatSentTime();
      const requestedLabel = formatDisplayDate();
      setCompletionPhase('pending_review');
      setCompletionRequestedAt(requestedLabel);
      const followUp: ChatMessage = userIsProvider
        ? {
            id: `sent-completion-req-${Date.now()}`,
            kind: 'sent',
            text: `I have requested completion for “${ctx.title}”. Please review the service delivered when you are ready.`,
            time,
          }
        : {
            id: `recv-completion-req-${Date.now()}`,
            kind: 'received',
            text: `I have finished the work for “${ctx.title}”. Please review the service delivered in Official Details and confirm when you are satisfied.`,
            time,
          };
      appendEngagementSystemMessages([
        {
          id: `system-completion-req-${Date.now()}`,
          kind: 'system',
          text: `${providerName} has requested to mark “${ctx.title}” complete.`,
          time,
        },
        followUp,
      ]);
    },
    [thread.participant.displayName, userIsProvider, appendEngagementSystemMessages]
  );

  const handleRequestOfficialCompletion = useCallback(async () => {
    if (!thread.postContext || officialEngagementStatus !== 'active' || completionPhase !== 'none') {
      return;
    }
    if (!userIsProvider) return;
    const ctx = thread.postContext;
    const confirmed = await showConfirm({
      title: 'Request Completion?',
      message: `Notify ${thread.participant.displayName} that the service for “${ctx.title}” is ready for review. They must confirm before this undertaking is closed.`,
      confirmLabel: 'Request Completion',
      cancelLabel: 'Not Yet',
      icon: 'checkmark-done-outline',
    });
    if (!confirmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    applyProviderCompletionRequest(ctx);
  }, [
    thread.postContext,
    thread.participant.displayName,
    officialEngagementStatus,
    completionPhase,
    userIsProvider,
    showConfirm,
    applyProviderCompletionRequest,
  ]);

  const completeUndertakingAsClient = useCallback(
    (ctx: NonNullable<ChatThread['postContext']>) => {
      setOfficialEngagementStatus('completed');
      setCompletionPhase('completed');
      const time = formatSentTime();
      appendEngagementSystemMessages([
        {
          id: `system-complete-${Date.now()}`,
          kind: 'system',
          text: `Official undertaking for “${ctx.title}” is complete. Both parties agreed.`,
          time,
        },
        {
          id: `recv-complete-${Date.now()}`,
          kind: 'received',
          text: `Thank you for confirming. I have marked our agreement for “${ctx.title}” as complete.`,
          time,
        },
      ]);
      const dealId = recordCompletedDeal({
        revieweeUsername: thread.providerUsername,
        postId: ctx.postId,
        postTitle: ctx.title,
        completedAt: formatDisplayDate(),
      });
      promptOptionalReview(dealId);
    },
    [
      thread.providerUsername,
      appendEngagementSystemMessages,
      recordCompletedDeal,
      promptOptionalReview,
    ]
  );

  const handleConfirmOfficialCompletion = useCallback(async () => {
    if (!thread.postContext || completionPhase !== 'pending_review' || userIsProvider) return;
    const ctx = thread.postContext;
    const confirmed = await showConfirm({
      title: 'Confirm Service Delivered?',
      message: `Both parties must agree to close this undertaking for “${ctx.title}”. Only confirm if the service met what was agreed.`,
      confirmLabel: 'Confirm Complete',
      cancelLabel: 'Cancel',
      icon: 'checkmark-circle-outline',
    });
    if (!confirmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeUndertakingAsClient(ctx);
  }, [
    thread.postContext,
    completionPhase,
    userIsProvider,
    showConfirm,
    completeUndertakingAsClient,
  ]);

  const handleDeclineOfficialCompletion = useCallback(async () => {
    if (!thread.postContext || completionPhase !== 'pending_review' || userIsProvider) return;
    const ctx = thread.postContext;
    const confirmed = await showConfirm({
      title: 'Needs More Work?',
      message: `Decline completion for now and let ${thread.participant.displayName} know the service for “${ctx.title}” still needs attention.`,
      confirmLabel: 'Decline for Now',
      cancelLabel: 'Cancel',
      variant: 'destructive',
      icon: 'alert-circle-outline',
    });
    if (!confirmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCompletionPhase('none');
    setCompletionRequestedAt(undefined);
    const time = formatSentTime();
    appendEngagementSystemMessages([
      {
        id: `system-decline-${Date.now()}`,
        kind: 'system',
        text: `Completion for “${ctx.title}” was declined — more work is needed.`,
        time,
      },
      {
        id: `recv-decline-${Date.now()}`,
        kind: 'received',
        text: `Thanks for the update. I understand more work is needed on “${ctx.title}”. Let me know when you are ready to review again.`,
        time,
      },
    ]);
  }, [
    thread.postContext,
    thread.participant.displayName,
    completionPhase,
    userIsProvider,
    showConfirm,
    appendEngagementSystemMessages,
  ]);

  const handleReviewNow = useCallback(() => {
    if (!thread.postContext) return;
    setReviewPromptVisible(false);
    router.push(
      `/provider/${thread.providerUsername}/review?postId=${encodeURIComponent(thread.postContext.postId)}` as any
    );
  }, [thread.postContext, thread.providerUsername, router]);

  const handleReviewLater = useCallback(() => {
    if (pendingReviewDealId) {
      dismissReviewPrompt(pendingReviewDealId);
    }
    setReviewPromptVisible(false);
    setPendingReviewDealId(null);
  }, [pendingReviewDealId, dismissReviewPrompt]);

  const handleMenuSelect = useCallback(
    (action: ChatMenuAction) => {
      if (action === 'browseServices') {
        setServicesVisible(true);
      } else if (
        (action === 'officialService' || action === 'officialRequest') &&
        thread.postContext
      ) {
        setEngagementSheetVisible(true);
      } else if (action === 'cancelOfficialRequest') {
        handleCancelOfficialRequest();
      } else if (action === 'withdrawOfficialResponse') {
        handleWithdrawOfficialResponse();
      } else if (action === 'viewOfficialDetails' || action === 'reviewOfficialCompletion') {
        openOfficialDetails();
      } else if (action === 'requestOfficialCompletion') {
        handleRequestOfficialCompletion();
      } else if (action === 'viewProviderProfile') {
        onViewProviderProfile?.();
      }
    },
    [
      thread.postContext,
      handleCancelOfficialRequest,
      handleWithdrawOfficialResponse,
      openOfficialDetails,
      handleRequestOfficialCompletion,
      onViewProviderProfile,
    ]
  );

  const handleConfirmOfficialEngagement = useCallback(() => {
    if (!thread.postContext) return;
    const ctx = thread.postContext;
    const isRequest = ctx.tag === 'Request';
    setOfficialEngagementStatus('active');
    setCompletionPhase('none');
    setEngagementStartedAt(formatDisplayDate());
    setCompletionRequestedAt(undefined);
    const time = formatSentTime();
    setDateGroups((prev) =>
      appendMessages(prev, [
        {
          id: `system-engagement-${Date.now()}`,
          kind: 'system',
          text: isRequest
            ? `Official response submitted for “${ctx.title}”.`
            : `Official service request started for “${ctx.title}”.`,
          time,
        },
        {
          id: `recv-engagement-${Date.now()}`,
          kind: 'received',
          text: isRequest
            ? `Thanks! I received your official response to my request for “${ctx.title}”. I will review and get back to you.`
            : `Thanks! I have received your official request for “${ctx.title}”. I will confirm details shortly.`,
          time,
        },
      ])
    );
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });

    if (!isRequest) {
      const ctx = thread.postContext;
      const providerName = thread.participant.displayName;
      setTimeout(() => {
        setCompletionPhase('pending_review');
        setCompletionRequestedAt(formatDisplayDate());
        appendEngagementSystemMessages([
          {
            id: `system-provider-req-${Date.now()}`,
            kind: 'system',
            text: `${providerName} has requested to mark “${ctx.title}” complete.`,
            time: formatSentTime(),
          },
          {
            id: `recv-provider-req-${Date.now()}`,
            kind: 'received',
            text: `I have finished the work for “${ctx.title}”. Please review the service delivered in Official Details and confirm when you are satisfied.`,
            time: formatSentTime(),
          },
        ]);
      }, 2800);
    }
  }, [thread.postContext, thread.participant.displayName, appendEngagementSystemMessages]);

  const handleAttachSelect = useCallback((action: ChatAttachmentAction) => {
    if (action === 'photos' || action === 'documents') {
      // Pure UI — picker not wired yet.
    }
  }, []);

  const handleAttach = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachVisible(true);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDateGroups((prev) => appendSentMessage(prev, trimmed));
    setDraft('');
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [draft]);

  const displayGroups = useMemo(() => dateGroups, [dateGroups]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <ChatHeader
        participant={thread.participant}
        subtleBg={subtleBg}
        textColor={Colors.text}
        mutedColor={Colors.icon}
        onBack={onBack}
        onMoreOptions={handleMoreOptions}
      />

      {thread.postContext ? (
        <ChatContextBanner
          context={thread.postContext}
          cardBg={cardBg}
          subtleBg={subtleBg}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          primaryColor={Colors.primary}
          officialEngagementActive={officialEngagementStatus === 'active'}
          officialEngagementCompleted={officialEngagementStatus === 'completed'}
          officialCompletionPending={
            officialEngagementStatus === 'active' && completionPhase === 'pending_review' && userIsProvider
          }
          officialCompletionNeedsReview={
            officialEngagementStatus === 'active' &&
            completionPhase === 'pending_review' &&
            !userIsProvider
          }
          onPress={handleContextBannerPress}
        />
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {displayGroups.map((group) => (
            <View key={group.dateLabel}>
              <View style={styles.dateSeparator}>
                <View style={[styles.dateLine, { backgroundColor: subtleBg }]} />
                <Text style={[styles.dateLabel, { color: Colors.icon }]}>{group.dateLabel}</Text>
                <View style={[styles.dateLine, { backgroundColor: subtleBg }]} />
              </View>
              {group.messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  sentBg={sentBg}
                  sentText={sentText}
                  receivedBg={cardBg}
                  receivedText={Colors.text}
                  mutedColor={Colors.icon}
                  primaryColor={Colors.primary}
                  systemBg={subtleBg}
                  systemAccent={contextAccent}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        <ChatComposer
          value={draft}
          onChangeText={setDraft}
          onAttach={handleAttach}
          onSend={handleSend}
          cardBg={cardBg}
          subtleBg={subtleBg}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          primaryColor={Colors.primary}
          bottomInset={insets.bottom}
        />
      </KeyboardAvoidingView>

      <ChatOptionsSheet
        visible={optionsVisible}
        showBrowseServices={!thread.postContext}
        showOfficialService={canOfficialService}
        showOfficialRequest={canOfficialRequest}
        showViewProviderProfile={showViewProviderProfile}
        officialEngagementActive={hasOfficialEngagement}
        officialEngagementCompleted={officialEngagementStatus === 'completed'}
        engagementTag={thread.postContext?.tag}
        completionPhase={completionPhase}
        isCurrentUserProvider={userIsProvider}
        onSelect={handleMenuSelect}
        onClose={() => setOptionsVisible(false)}
      />

      {thread.postContext ? (
        <>
          <ChatOfficialEngagementSheet
            visible={engagementSheetVisible}
            context={thread.postContext}
            contactName={thread.participant.displayName}
            onConfirm={handleConfirmOfficialEngagement}
            onClose={() => setEngagementSheetVisible(false)}
          />
          <ChatOfficialDetailsSheet
            visible={detailsSheetVisible}
            context={thread.postContext}
            contactName={thread.participant.displayName}
            engagementStatus={officialEngagementStatus}
            completionPhase={completionPhase}
            startedAt={engagementStartedAt}
            completionRequestedAt={completionRequestedAt}
            onRequestCompletion={handleRequestOfficialCompletion}
            onConfirmCompletion={handleConfirmOfficialCompletion}
            onDeclineCompletion={handleDeclineOfficialCompletion}
            onOpenPost={handleOpenPost}
            onClose={() => setDetailsSheetVisible(false)}
          />
        </>
      ) : null}

      <ChatAttachmentSheet
        visible={attachVisible}
        onSelect={handleAttachSelect}
        onClose={() => setAttachVisible(false)}
      />

      <ProviderServicesSheet
        visible={servicesVisible}
        providerName={thread.participant.displayName}
        services={providerServices}
        onSelectService={(postId) => onOpenPostForRequest?.(postId)}
        onClose={() => setServicesVisible(false)}
      />

      {confirmOptions ? (
        <ConfirmDialog
          visible={confirmVisible}
          title={confirmOptions.title}
          message={confirmOptions.message}
          confirmLabel={confirmOptions.confirmLabel}
          cancelLabel={confirmOptions.cancelLabel}
          variant={confirmOptions.variant}
          icon={confirmOptions.icon}
          onConfirm={handleConfirmDialog}
          onCancel={handleCancelDialog}
        />
      ) : null}

      <ReviewPromptDialog
        visible={reviewPromptVisible}
        providerName={thread.participant.displayName}
        serviceTitle={thread.postContext?.title ?? 'this service'}
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
  flex: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default ChatView;
