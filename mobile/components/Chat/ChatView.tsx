import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';

import { ConfirmDialog } from '../ConfirmDialog';
import { ReviewPromptDialog } from '../ReviewPromptDialog';
import { ReportSheet } from '../ReportSheet';
import { useAppRouter, useConfirmDialog, useThemeColor, useImagePicker, usePullToRefreshOnHeader, useProviderReviews, useChat } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { getProviderServices, isCurrentUserProvider } from '../../lib';
import { ChatHeader } from './ChatHeader';
import { ChatContextBanner } from './ChatContextBanner';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatComposer } from './ChatComposer';
import { ChatOptionsSheet, type ChatMenuAction } from './ChatOptionsSheet';
import { ChatAttachmentSheet, type ChatAttachmentAction } from './ChatAttachmentSheet';
import { ChatOfficialEngagementSheet } from './ChatOfficialEngagementSheet';
import { ProviderServicesSheet } from './ProviderServicesSheet';
import { ChatMessageActionsSheet } from './ChatMessageActionsSheet';
import { uploadService } from '../../services';
import { useAuthStore } from '../../store/authStore';
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
  hasPastServices?: boolean;
  onPastServices?: () => void;
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
  hasPastServices = false,
  onPastServices,
}) => {
  const userIsProvider = isCurrentUserProvider(currentUserId, serviceRequest);
  const router = useAppRouter();
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const { panHandlers } = usePullToRefreshOnHeader({ onRefresh: onRefresh || (() => { }), isRefreshing });
  const {
    showConfirm,
    confirmVisible,
    confirmOptions,
    handleConfirm: handleConfirmDialog,
    handleCancel: handleCancelDialog,
  } = useConfirmDialog();
  const dismissReviewPrompt = useProviderReviews((s) => s.dismissReviewPrompt);
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

  // Manual keyboard tracking for Android edge-to-edge
  const [androidKbHeight, setAndroidKbHeight] = useState(0);

  React.useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setAndroidKbHeight(e.endCoordinates.height + insets.bottom+10);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setAndroidKbHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  const [reportSheetVisible, setReportSheetVisible] = useState(false);

  const deleteMessage = useChat((state) => state.deleteMessage);
  const conversations = useChat((state) => state.conversations);
  const muteConversation = useChat((state) => state.muteConversation);
  const unmuteConversation = useChat((state) => state.unmuteConversation);

  const isMuted = useMemo(() => {
    const conv = conversations.find((c) => c.user.username === thread.providerUsername);
    return conv?.isMuted ?? false;
  }, [conversations, thread.providerUsername]);

  // headerHeight is measured via onLayout and used as the iOS keyboardVerticalOffset
  // so that KeyboardAvoidingView accounts for the header sitting outside its subtree.
  const [headerHeight, setHeaderHeight] = useState(0);
  const flatListRef = useRef<FlatList<FlatItem>>(null);
  const [dateGroups, setDateGroups] = useState<ChatDateGroup[]>(() =>
    thread.dateGroups.map((g) => ({ ...g, messages: [...g.messages] }))
  );

  React.useEffect(() => {
    setDateGroups(thread.dateGroups.map((g) => ({ ...g, messages: [...g.messages] })));
  }, [thread.dateGroups]);

  // ---------------------------------------------------------------------------
  // Flatten ChatDateGroup[] -> FlatItem[] for the inverted FlatList.
  // Messages are emitted newest-last (natural order), then the array is
  // reversed so index-0 is the newest message — inverted={true} on FlatList
  // flips the visual order back, putting newest at the bottom.
  // Date separators are injected as 'separator' items just before the first
  // message of each group (which after reversal = just after the last message
  // of that group visually).
  // ---------------------------------------------------------------------------
  type MessageItem = { type: 'message'; message: ChatMessage; key: string };
  type SeparatorItem = { type: 'separator'; dateLabel: string; key: string };
  type FlatItem = MessageItem | SeparatorItem;

  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const group of dateGroups) {
      items.push({ type: 'separator', dateLabel: group.dateLabel, key: `sep-${group.dateLabel}` });
      for (const message of group.messages) {
        items.push({ type: 'message', message, key: message.id });
      }
    }
    // Reverse so newest message is at index 0 (pairs with inverted={true}).
    return items.slice().reverse();
  }, [dateGroups]);

  const providerServices = useMemo(
    () => getProviderServices(thread.providerUsername),
    [thread.providerUsername]
  );

  const handleOpenPost = useCallback(() => {
    if (!thread.postContext) return;
    onOpenPost?.(thread.postContext.postId);
  }, [thread.postContext, onOpenPost]);

  const handleMoreOptions = useCallback(() => {
    setOptionsVisible(true);
  }, []);

  const {
    officialEngagementStatus,
    completionPhase,
    serviceRequestId,
  } = engagement;

  const currentUserRole = useAuthStore((s) => s.user?.role);

  const showViewProviderProfile =
    (!thread.postContext || thread.postContext.tag === 'Service') &&
    !userIsProvider &&
    currentUserRole !== 'provider';
  const hasOfficialEngagement =
    officialEngagementStatus === 'active' || officialEngagementStatus === 'completed';

  const contextAccent =
    thread.postContext?.tag === 'Request' ? REQUEST_ACCENT : Colors.primary;

  const openOfficialDetails = useCallback(() => {
    if (!serviceRequestId) return;
    router.push(`/service-request/${serviceRequestId}` as any);
  }, [serviceRequestId, router]);

  const handleContextBannerPress = useCallback(() => {
    if (hasOfficialEngagement) {
      openOfficialDetails();
      return;
    }
    handleOpenPost();
  }, [hasOfficialEngagement, openOfficialDetails, handleOpenPost]);




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
      } else if (action === 'report') {
        setReportSheetVisible(true);
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
    setAttachVisible(true);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (onSendMessage) {
      onSendMessage(trimmed);
    } else {
      setDateGroups((prev) => appendSentMessage(prev, trimmed));
    }
    setDraft('');
    // With an inverted FlatList, index 0 is always the newest message.
    // Scrolling to offset 0 == scrolling to the bottom (composer end).
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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

  // renderFlatItem handles both message bubbles and date separators.
  const renderFlatItem = useCallback(({ item }: { item: FlatItem }) => {
    if (item.type === 'separator') {
      return (
        <View style={styles.dateSeparator}>
          <View style={[styles.dateLine, { backgroundColor: subtleBg }]} />
          <Text style={[styles.dateLabel, { color: Colors.icon }]}>{item.dateLabel}</Text>
          <View style={[styles.dateLine, { backgroundColor: subtleBg }]} />
        </View>
      );
    }
    return (
      <ChatMessageBubble
        message={item.message}
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
    );
  }, [subtleBg, Colors.icon, Colors.text, Colors.primary, sentBg, sentText, cardBg, contextAccent,
    handleRetryMessage, handleDeleteMessage, handleMessageLongPress]);

  const hasPendingMessage = useMemo(() => {
    return dateGroups.some(group => group.messages.some(msg => msg.status === 'pending'));
  }, [dateGroups]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      {/* Header sits outside KeyboardAvoidingView — we measure its height to use
          as keyboardVerticalOffset so iOS padding-mode accounts for it correctly. */}
      <View
        {...panHandlers}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
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
      </View>

      <KeyboardAvoidingView
        style={[
          styles.flex,
          Platform.OS === 'android' && androidKbHeight > 0
            ? { paddingBottom: Math.max(0, androidKbHeight - insets.bottom) }
            : undefined,
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + insets.top : 0}
      >
        {/* Inverted FlatList: index-0 = newest message = visually at bottom.
            Pull-to-refresh fires onEndReached (which in inverted = scroll up = top visually),
            so onEndReached is used for loading older messages. */}
        <FlatList<FlatItem>
          ref={flatListRef}
          data={flatItems}
          keyExtractor={(item) => item.key}
          renderItem={renderFlatItem}
          inverted
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContentInverted}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          // Load older messages when the user scrolls to the top (= onEndReached in inverted list)
          onEndReached={() => {
            if (hasMore && !isLoadingMore && onLoadMore) {
              onLoadMore();
            }
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={Colors.icon} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />

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
        hasPastServices={hasPastServices}
        onPastServices={onPastServices}
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

      <ReportSheet
        visible={reportSheetVisible}
        targetType="user"
        targetId={conversations.find((c) => c.user.username === thread.providerUsername)?.user.id || ''}
        onClose={() => setReportSheetVisible(false)}
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
  // Inverted list: padding is flipped — paddingTop becomes visual bottom padding
  // (space below the newest message), paddingBottom becomes visual top padding.
  messagesContentInverted: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
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
