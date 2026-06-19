import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ConfirmDialog } from '../ConfirmDialog';
import { ReviewPromptDialog } from '../ReviewPromptDialog';
import { useAppRouter, useConfirmDialog, useThemeColor, useImagePicker } from '../../hooks';
import { useProviderReviewsStore } from '../../store/providerReviewsStore';
import { Spacing, Typography } from '../../constants';
import { getProviderServices, isCurrentUserProvider, isCurrentUserRequester } from '../../lib';
import { ChatHeader } from './ChatHeader';
import { ChatContextBanner } from './ChatContextBanner';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatComposer } from './ChatComposer';
import { ChatOptionsSheet, type ChatMenuAction } from './ChatOptionsSheet';
import { ChatAttachmentSheet, type ChatAttachmentAction } from './ChatAttachmentSheet';
import { ChatOfficialEngagementSheet } from './ChatOfficialEngagementSheet';
import { ProviderServicesSheet } from './ProviderServicesSheet';
import { ChatMessageActionsSheet } from './ChatMessageActionsSheet';
import { useChatStore } from '../../store/chatStore';
import { uploadService } from '../../services';
import type {
  ChatDateGroup,
  ChatMessage,
  ChatThread,
} from '../../types';
import type { OfficialEngagementStatus } from '../../types/chat';
import type { ServiceEngagementState } from '../../lib/mapServiceRequest';

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
  onSendMessage?: (text: string) => void;
  engagement: ServiceEngagementState;
  engagementLoading?: boolean;
  onCreateOfficialEngagement: () => Promise<void>;
  onCancelOfficialEngagement: () => Promise<void>;
  onRequestCompletion: () => Promise<void>;
  onConfirmCompletion: () => Promise<void>;
  onDeclineCompletion: () => Promise<void>;
  onAcceptOfficialEngagement?: () => Promise<void>;
  onDeclineOfficialEngagement?: () => Promise<void>;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  currentUserId: string;
  serviceRequest: any;
  onClearPostContext: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  thread,
  onBack,
  onOpenPost,
  onOpenPostForRequest,
  onViewProviderProfile,
  onSendMessage,
  engagement,
  engagementLoading = false,
  onCreateOfficialEngagement,
  onCancelOfficialEngagement,
  onRequestCompletion,
  onConfirmCompletion,
  onDeclineCompletion,
  onAcceptOfficialEngagement,
  onDeclineOfficialEngagement,
  isRefreshing = false,
  onRefresh,
  isLoadingMore = false,
  onLoadMore,
  hasMore = false,
  onDeleteMessage,
  currentUserId,
  serviceRequest,
  onClearPostContext,
}) => {
  const userIsProvider = isCurrentUserProvider(currentUserId, serviceRequest);
  const router = useAppRouter();
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

  const { pickFromCamera, pickFromGallery } = useImagePicker({
    allowsMultipleSelection: true,
    selectionLimit: 5,
    quality: 0.8,
  });

  const [draft, setDraft] = useState('');
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [servicesVisible, setServicesVisible] = useState(false);
  const [engagementSheetVisible, setEngagementSheetVisible] = useState(false);
  const [reviewPromptVisible, setReviewPromptVisible] = useState(false);
  const [pendingReviewDealId, setPendingReviewDealId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [messageActionsVisible, setMessageActionsVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const conversations = useChatStore((state) => state.conversations);
  const muteConversation = useChatStore((state) => state.muteConversation);
  const unmuteConversation = useChatStore((state) => state.unmuteConversation);
  
  const isMuted = useMemo(() => {
    const conv = conversations.find((c) => c.user.username === thread.providerUsername);
    return conv?.isMuted ?? false;
  }, [conversations, thread.providerUsername]);

  const scrollRef = useRef<ScrollView>(null);
  const [dateGroups, setDateGroups] = useState<ChatDateGroup[]>(() =>
    thread.dateGroups.map((g) => ({ ...g, messages: [...g.messages] }))
  );

  React.useEffect(() => {
    setDateGroups(thread.dateGroups.map((g) => ({ ...g, messages: [...g.messages] })));
  }, [thread.dateGroups]);

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

  const {
    officialEngagementStatus,
    completionPhase,
    startedAt: engagementStartedAt,
    completionRequestedAt,
    serviceRequestId,
  } = engagement;

  const canOfficialService =
    thread.postContext?.tag === 'Service' && officialEngagementStatus === 'none' && !engagementLoading;
  const canOfficialRequest =
    thread.postContext?.tag === 'Request' && officialEngagementStatus === 'none' && !engagementLoading;
  const showViewProviderProfile =
    (!thread.postContext || thread.postContext.tag === 'Service') && !userIsProvider;
  const hasOfficialEngagement =
    officialEngagementStatus === 'active' || officialEngagementStatus === 'completed';

  const contextAccent =
    thread.postContext?.tag === 'Request' ? REQUEST_ACCENT : Colors.primary;

  const openOfficialDetails = useCallback(() => {
    if (!serviceRequestId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/service-request/${serviceRequestId}` as any);
  }, [serviceRequestId, router]);

  const handleContextBannerPress = useCallback(() => {
    if (hasOfficialEngagement) {
      openOfficialDetails();
      return;
    }
    handleOpenPost();
  }, [hasOfficialEngagement, openOfficialDetails, handleOpenPost]);



  const promptOptionalReview = useCallback(
    (dealId: string) => {
      setPendingReviewDealId(dealId);
      setReviewPromptVisible(true);
    },
    []
  );

  const handleCancelOfficialRequest = useCallback(async () => {
    if (!thread.postContext || actionLoading) return;
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
    setActionLoading(true);
    try {
      await onCancelOfficialEngagement();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [thread.postContext, actionLoading, showConfirm, onCancelOfficialEngagement]);

  const handleWithdrawOfficialResponse = useCallback(async () => {
    if (!thread.postContext || actionLoading) return;
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
    setActionLoading(true);
    try {
      await onCancelOfficialEngagement();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [thread.postContext, actionLoading, showConfirm, onCancelOfficialEngagement]);

  const handleRequestOfficialCompletion = useCallback(async () => {
    if (
      !thread.postContext ||
      officialEngagementStatus !== 'active' ||
      completionPhase !== 'none' ||
      !userIsProvider ||
      actionLoading
    ) {
      return;
    }
    const ctx = thread.postContext;
    const confirmed = await showConfirm({
      title: 'Request Completion?',
      message: `Notify ${thread.participant.displayName} that the service for “${ctx.title}” is ready for review. They must confirm before this undertaking is closed.`,
      confirmLabel: 'Request Completion',
      cancelLabel: 'Not Yet',
      icon: 'checkmark-done-outline',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await onRequestCompletion();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [
    thread.postContext,
    thread.participant.displayName,
    officialEngagementStatus,
    completionPhase,
    userIsProvider,
    actionLoading,
    showConfirm,
    onRequestCompletion,
  ]);

  const completeUndertakingAsClient = useCallback(
    (ctx: NonNullable<ChatThread['postContext']>) => {
      const dealId = recordCompletedDeal({
        id: serviceRequestId ?? undefined,
        revieweeUsername: thread.providerUsername,
        postId: ctx.postId,
        postTitle: ctx.title,
        completedAt: formatDisplayDate(),
        serviceRequestId: serviceRequestId ?? undefined,
      });
      promptOptionalReview(dealId);
    },
    [
      thread.providerUsername,
      serviceRequestId,
      recordCompletedDeal,
      promptOptionalReview,
    ]
  );

  const handleConfirmOfficialCompletion = useCallback(async () => {
    if (
      !thread.postContext ||
      completionPhase !== 'pending_review' ||
      userIsProvider ||
      actionLoading
    ) {
      return;
    }
    const ctx = thread.postContext;
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
      await onConfirmCompletion();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeUndertakingAsClient(ctx);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [
    thread.postContext,
    completionPhase,
    userIsProvider,
    actionLoading,
    showConfirm,
    onConfirmCompletion,
    completeUndertakingAsClient,
  ]);

  const handleDeclineOfficialCompletion = useCallback(async () => {
    if (
      !thread.postContext ||
      completionPhase !== 'pending_review' ||
      userIsProvider ||
      actionLoading
    ) {
      return;
    }
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
    setActionLoading(true);
    try {
      await onDeclineCompletion();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [
    thread.postContext,
    thread.participant.displayName,
    completionPhase,
    userIsProvider,
    actionLoading,
    showConfirm,
    onDeclineCompletion,
  ]);

  const handleReviewNow = useCallback(() => {
    if (!thread.postContext) return;
    setReviewPromptVisible(false);
    const query = serviceRequestId
      ? `postId=${encodeURIComponent(thread.postContext.postId)}&serviceRequestId=${encodeURIComponent(serviceRequestId)}`
      : `postId=${encodeURIComponent(thread.postContext.postId)}`;
    router.push(`/provider/${thread.providerUsername}/review?${query}` as any);
  }, [thread.postContext, thread.providerUsername, serviceRequestId, router]);

  const handleReviewLater = useCallback(() => {
    if (pendingReviewDealId) {
      dismissReviewPrompt(pendingReviewDealId);
    }
    setReviewPromptVisible(false);
    setPendingReviewDealId(null);
  }, [pendingReviewDealId, dismissReviewPrompt]);

  const handleConfirmOfficialEngagement = useCallback(async () => {
    if (!thread.postContext || actionLoading) return;
    const ctx = thread.postContext;
    setActionLoading(true);
    try {
      await onCreateOfficialEngagement();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [thread.postContext, actionLoading, onCreateOfficialEngagement]);

  const handleAcceptOfficialEngagement = useCallback(async () => {
    if (!thread.postContext || actionLoading || !onAcceptOfficialEngagement) return;
    const ctx = thread.postContext;
    setActionLoading(true);
    try {
      await onAcceptOfficialEngagement();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [thread.postContext, actionLoading, onAcceptOfficialEngagement]);

  const handleDeclineOfficialEngagement = useCallback(async () => {
    if (!thread.postContext || actionLoading || !onDeclineOfficialEngagement) return;
    const ctx = thread.postContext;
    setActionLoading(true);
    try {
      await onDeclineOfficialEngagement();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(false);
    }
  }, [thread.postContext, actionLoading, onDeclineOfficialEngagement]);

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
      } else if (action === 'acceptOfficialEngagement') {
        handleAcceptOfficialEngagement();
      } else if (action === 'declineOfficialEngagement') {
        handleDeclineOfficialEngagement();
      } else if (action === 'viewOfficialDetails' || action === 'reviewOfficialCompletion') {
        openOfficialDetails();
      } else if (action === 'requestOfficialCompletion') {
        handleRequestOfficialCompletion();
      } else if (action === 'viewProviderProfile') {
        onViewProviderProfile?.();
      } else if (action === 'mute') {
        if (isMuted) {
          unmuteConversation(thread.providerUsername);
        } else {
          muteConversation(thread.providerUsername);
        }
      } else if (action === 'notInterested') {
        onClearPostContext();
      }
    },
    [
      thread.postContext,
      thread.providerUsername,
      handleCancelOfficialRequest,
      handleWithdrawOfficialResponse,
      handleAcceptOfficialEngagement,
      handleDeclineOfficialEngagement,
      openOfficialDetails,
      handleRequestOfficialCompletion,
      onViewProviderProfile,
      isMuted,
      muteConversation,
      unmuteConversation,
      onClearPostContext,
    ]
  );

  const handleAttachSelect = useCallback(async (action: ChatAttachmentAction) => {
    if (isUploading) return;

    if (action === 'camera') {
      const cameraImage = await pickFromCamera();
      if (!cameraImage) return;
      try {
        setIsUploading(true);
        const url = await uploadService.uploadImage(cameraImage.uri);
        if (onSendMessage) {
          onSendMessage(url);
        } else {
          setDateGroups((prev) => appendSentMessage(prev, url));
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else if (action === 'photos') {
      const images = await pickFromGallery();
      if (images.length === 0) return;
      try {
        setIsUploading(true);
        // Upload each image sequentially
        for (const image of images) {
          const url = await uploadService.uploadImage(image.uri);
          if (onSendMessage) {
            onSendMessage(url);
          } else {
            setDateGroups((prev) => appendSentMessage(prev, url));
          }
        }
      } catch (error) {
        console.error('Failed to upload images:', error);
        Alert.alert('Error', 'Failed to upload images. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else if (action === 'documents') {
      const DocumentPicker = require('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const doc = result.assets[0];
      try {
        setIsUploading(true);
        const url = await uploadService.uploadFile(
          doc.uri,
          doc.name,
          doc.mimeType ?? 'application/octet-stream'
        );
        const messageContent = `doc::${doc.name}::${url}`;
        if (onSendMessage) {
          onSendMessage(messageContent);
        } else {
          setDateGroups((prev) => appendSentMessage(prev, messageContent));
        }
      } catch (error) {
        console.error('Failed to upload document:', error);
        Alert.alert('Error', 'Failed to upload document. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  }, [pickFromCamera, pickFromGallery, onSendMessage, isUploading]);

  const handleAttach = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachVisible(true);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onSendMessage) {
      onSendMessage(trimmed);
    } else {
      setDateGroups((prev) => appendSentMessage(prev, trimmed));
    }
    setDraft('');
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [draft, onSendMessage]);

  const handleRetryMessage = useCallback((message: ChatMessage) => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    } else {
      setDateGroups(prev => prev.map(g => ({
        ...g,
        messages: g.messages.filter(m => m.id !== message.id)
      })).filter(g => g.messages.length > 0));
    }
    
    if (onSendMessage) {
      onSendMessage(message.text);
    }
  }, [onSendMessage, onDeleteMessage]);

  const handleMessageLongPress = useCallback((message: ChatMessage) => {
    setSelectedMessage(message);
    setMessageActionsVisible(true);
  }, []);

  const handleDeleteMessage = useCallback((message: ChatMessage) => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    } else {
      setDateGroups(prev => prev.map(g => ({
        ...g,
        messages: g.messages.filter(m => m.id !== message.id)
      })).filter(g => g.messages.length > 0));
    }
  }, [onDeleteMessage]);

  const displayGroups = useMemo(() => dateGroups, [dateGroups]);

  const hasPendingMessage = useMemo(() => {
    return dateGroups.some(group => group.messages.some(msg => msg.status === 'pending'));
  }, [dateGroups]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatHeader
          participant={thread.participant}
          subtleBg={subtleBg}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          primaryColor={Colors.primary}
          onBack={onBack}
          onMoreOptions={handleMoreOptions}
        />

        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={true}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          onScroll={(event) => {
            const { contentOffset } = event.nativeEvent;
            if (contentOffset.y <= 0 && hasMore && !isLoadingMore && onLoadMore) {
              onLoadMore();
            }
          }}
        >
          {isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}
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
                  onRetry={handleRetryMessage}
                  onDelete={handleDeleteMessage}
                  onLongPress={handleMessageLongPress}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        {thread.postContext && !((officialEngagementStatus as OfficialEngagementStatus) === 'completed') ? (
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
          hasPendingMessage={hasPendingMessage || isUploading}
        />
      </KeyboardAvoidingView>

      <ChatOptionsSheet
        visible={optionsVisible}
        showBrowseServices={!thread.postContext}
        showViewProviderProfile={showViewProviderProfile}
        officialEngagementActive={hasOfficialEngagement}
        officialEngagementCompleted={officialEngagementStatus === 'completed'}
        postContext={thread.postContext}
        completionPhase={completionPhase}
        currentUserId={currentUserId}
        serviceRequest={serviceRequest}
        isMuted={isMuted}
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
            isLoading={actionLoading}
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
      <ChatMessageActionsSheet
        visible={messageActionsVisible}
        message={selectedMessage}
        isSentByCurrentUser={selectedMessage?.kind === 'sent'}
        onDelete={deleteMessage}
        onClose={() => {
          setMessageActionsVisible(false);
          setSelectedMessage(null);
        }}
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
  loadingMoreContainer: {
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
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
