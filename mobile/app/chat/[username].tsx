import React, { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ChatView } from '../../components/Chat';
import { buildProviderProfileHref, isCurrentUserProvider, isCurrentUserRequester, mapServiceRequestToEngagement } from '../../lib';
import { useAppRouter } from '../../hooks';
import { useChat } from '../../hooks/useChat';
import { Spacing, Typography } from '../../constants';
import { profileService } from '../../services/profileService';
import { postService } from '../../services/postService';
import { parsePostPrice } from '../../lib/mapDbPost';
import { useServiceRequestsStore } from '../../store';
import { useProviderReviewsStore } from '../../store/providerReviewsStore';
import { useAuthStore } from '../../store';
import { ChatPostContext, ChatThread } from '../../types';

export default function ChatScreen() {
  const { username, postId } = useLocalSearchParams<{
    username: string;
    postId?: string;
  }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F4';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id ?? '';
  const resolvedPostId = typeof postId === 'string' ? postId : undefined;

  const { activeThread, isLoading, isRefreshing, error, fetchMessages, sendMessage, subscribeToMessages, isLoadingMoreMessages, hasMoreMessages, loadMoreMessages, removeMessage, clearPostContext } = useChat();

  const handleRefresh = useCallback(() => {
    if (username && activeThread) {
      fetchMessages(username, activeThread.participant, activeThread.postContext, true);
    }
  }, [username, activeThread, fetchMessages]);
  const requests = useServiceRequestsStore((s) => s.requests);
  const fetchForChat = useServiceRequestsStore((s) => s.fetchForChat);
  const createOfficialEngagement = useServiceRequestsStore((s) => s.createOfficialEngagement);
  const transition = useServiceRequestsStore((s) => s.transition);
  const accept = useServiceRequestsStore((s) => s.accept);
  const decline = useServiceRequestsStore((s) => s.decline);
  const [engagementLoading, setEngagementLoading] = React.useState(false);

  useEffect(() => {
    const loadChat = async () => {
      if (username) {
        try {
          // First fetch participant profile (always required)
          const participantProfile = await profileService.getPublicProfile(username);
          
          // Then try to fetch post context, but don't fail the whole chat if it fails
          let post;
          try {
            post = resolvedPostId ? await postService.getPostById(resolvedPostId) : undefined;
          } catch (postError) {
            console.warn('Failed to fetch post context for chat:', postError);
            post = undefined;
          }

          let postContext: ChatPostContext | undefined = undefined;
          if (post) {
            const price = parsePostPrice(post.price);
            let priceLabel = '';
            if (price.kind === 'fixed') {
              priceLabel = `$${price.amount}`;
            } else if (price.kind === 'range') {
              priceLabel = `$${price.min}-$${price.max}`;
            }

            postContext = {
              postId: post.id,
              title: post.title,
              tag: post.tag as 'Service' | 'Request',
              priceLabel,
              authorId: post.authorId,
            };
          }

          fetchMessages(
            username,
            {
              displayName: participantProfile.name || username,
              handle: `@${participantProfile.username || username}`,
              avatarUrl: participantProfile.avatarUrl || '',
            },
            postContext
          );
        } catch (error) {
          console.error('Failed to load chat:', error);
          fetchMessages(
            username,
            {
              displayName: username,
              handle: `@${username}`,
              avatarUrl: '',
            },
            undefined
          );
        }

        subscribeToMessages();
      }
    };
    loadChat();
  }, [username, resolvedPostId, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    if (!username || !resolvedPostId) return;
    setEngagementLoading(true);
    void fetchForChat(resolvedPostId, username).finally(() => setEngagementLoading(false));
  }, [username, resolvedPostId, fetchForChat]);

  const chatServiceRequest = useMemo(() => {
    if (!resolvedPostId || !username) return null;
    return (
      requests.find(
        (r) =>
          r.postId === resolvedPostId &&
          (r.requester?.username === username || r.provider?.username === username) &&
          r.status !== 'cancelled' &&
          r.status !== 'declined'
      ) ?? null
    );
  }, [requests, resolvedPostId, username]);

  const engagement = useMemo(
    () => mapServiceRequestToEngagement(chatServiceRequest),
    [chatServiceRequest]
  );

  const recordCompletedDeal = useProviderReviewsStore((s) => s.recordCompletedDeal);

  useEffect(() => {
    if (
      !chatServiceRequest ||
      chatServiceRequest.status !== 'completed' ||
      !activeThread?.postContext
    ) {
      return;
    }
    
    // Only the client (requester) should record the completed deal to leave a review
    if (chatServiceRequest.requesterId !== currentUserId) {
      return;
    }

    // Get reviewee username - prefer chatServiceRequest data, fall back to activeThread or route param
    let revieweeUsername: string;
    if (chatServiceRequest.provider?.username) {
      revieweeUsername = chatServiceRequest.provider.username;
    } else if (chatServiceRequest.requester?.username && chatServiceRequest.requester.username !== username) {
      revieweeUsername = chatServiceRequest.requester.username;
    } else if (activeThread?.providerUsername) {
      revieweeUsername = activeThread.providerUsername;
    } else {
      revieweeUsername = username;
    }

    recordCompletedDeal({
      id: chatServiceRequest.id,
      serviceRequestId: chatServiceRequest.id,
      revieweeUsername,
      postId: activeThread.postContext.postId,
      postTitle: activeThread.postContext.title,
      completedAt: chatServiceRequest.completedAt
        ? new Date(chatServiceRequest.completedAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : new Date().toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
    });
  }, [chatServiceRequest, activeThread, currentUserId, recordCompletedDeal, username]);

  const exitToMessages = useCallback(() => {
    router.replace('/(tabs)/messages' as any);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        exitToMessages();
        return true;
      });
      return () => sub.remove();
    }, [exitToMessages])
  );

  const handleOpenPost = useCallback(
    (id: string) => {
      router.push(`/post/${id}?fromProvider=1&fromChat=1&forceNonOwner=1` as any);
    },
    [router]
  );

  const handleOpenPostForRequest = useCallback(
    (id: string) => {
      router.push(`/post/${id}?fromProvider=1&fromRequestService=1` as any);
    },
    [router]
  );

  const handleViewProviderProfile = useCallback(() => {
    if (typeof username !== 'string') return;
    router.push(buildProviderProfileHref(username) as any);
  }, [username, router]);

  const handleSendMessage = useCallback(
    (text: string) => {
      if (username) {
        const currentPostId = activeThread?.postContext?.postId;
        sendMessage(username, text, currentPostId);
      }
    },
    [username, sendMessage, activeThread]
  );

  const handleCreateOfficialEngagement = useCallback(async () => {
    if (!resolvedPostId) throw new Error('Missing post context');
    const request = await createOfficialEngagement(resolvedPostId);
    if (request.kind === 'response') {
      await accept(request.id);
    }
  }, [resolvedPostId, createOfficialEngagement, accept]);

  const handleAcceptOfficialEngagement = useCallback(async () => {
    if (!chatServiceRequest) throw new Error('No active engagement');
    await accept(chatServiceRequest.id);
  }, [chatServiceRequest, accept]);

  const handleDeclineOfficialEngagement = useCallback(async () => {
    if (!chatServiceRequest) throw new Error('No active engagement');
    await decline(chatServiceRequest.id);
  }, [chatServiceRequest, decline]);

  const handleCancelOfficialEngagement = useCallback(async () => {
    if (!chatServiceRequest) throw new Error('No active engagement');
    const userIsProvider = isCurrentUserProvider(currentUserId, chatServiceRequest);
    const userIsRequester = isCurrentUserRequester(currentUserId, chatServiceRequest);
    const action =
      userIsProvider ? 'withdraw' : 'cancel';
    await transition(chatServiceRequest.id, action);
  }, [chatServiceRequest, currentUserId, transition]);

  const handleRequestCompletion = useCallback(async () => {
    if (!chatServiceRequest) throw new Error('No active engagement');
    await transition(chatServiceRequest.id, 'request_completion');
  }, [chatServiceRequest, transition]);

  const handleConfirmCompletion = useCallback(async () => {
    if (!chatServiceRequest) throw new Error('No active engagement');
    await transition(chatServiceRequest.id, 'confirm_completion');
  }, [chatServiceRequest, transition]);

  const handleDeclineCompletion = useCallback(async () => {
    if (!chatServiceRequest) throw new Error('No active engagement');
    await transition(chatServiceRequest.id, 'decline_completion');
  }, [chatServiceRequest, transition]);

  // Removed initial loading indicator

  if (!activeThread && !isLoading) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <Text style={[styles.notFoundTitle, { color: textColor }]}>Chat not found</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={exitToMessages}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>Back to Messages</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ChatView
      thread={activeThread as ChatThread}
      onBack={exitToMessages}
      onOpenPost={handleOpenPost}
      onOpenPostForRequest={handleOpenPostForRequest}
      onViewProviderProfile={handleViewProviderProfile}
      onSendMessage={handleSendMessage}
      engagement={engagement}
      engagementLoading={engagementLoading}
      onCreateOfficialEngagement={handleCreateOfficialEngagement}
      onCancelOfficialEngagement={handleCancelOfficialEngagement}
      onRequestCompletion={handleRequestCompletion}
      onConfirmCompletion={handleConfirmCompletion}
      onDeclineCompletion={handleDeclineCompletion}
      onAcceptOfficialEngagement={handleAcceptOfficialEngagement}
      onDeclineOfficialEngagement={handleDeclineOfficialEngagement}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      isLoadingMore={isLoadingMoreMessages}
      onLoadMore={loadMoreMessages}
      hasMore={hasMoreMessages}
      onDeleteMessage={removeMessage}
      currentUserId={currentUserId}
      serviceRequest={chatServiceRequest}
      onClearPostContext={clearPostContext}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notFoundTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notFoundBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
});
