import React, { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ChatView } from '../../components/Chat';
import { buildProviderProfileHref, isCurrentUserProvider, mapServiceRequestToEngagement } from '../../lib';
import { useAppRouter } from '../../hooks';
import { useChat } from '../../hooks/useChat';
import { Spacing, Typography } from '../../constants';
import { profileService } from '../../services/profileService';
import { postService } from '../../services/postService';
import { parsePostPrice } from '../../lib/mapDbPost';
import { useServiceRequestsStore } from '../../store';
import { useProviderReviewsStore } from '../../store/providerReviewsStore';
import { ChatPostContext, ChatThread } from '../../types';

export default function ChatScreen() {
  const { username, postId } = useLocalSearchParams<{
    username: string;
    postId?: string;
  }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const resolvedPostId = typeof postId === 'string' ? postId : undefined;

  const { activeThread, isLoading, isRefreshing, error, fetchMessages, sendMessage, subscribeToMessages } = useChat();
  const requests = useServiceRequestsStore((s) => s.requests);
  const fetchForChat = useServiceRequestsStore((s) => s.fetchForChat);
  const createOfficialEngagement = useServiceRequestsStore((s) => s.createOfficialEngagement);
  const transition = useServiceRequestsStore((s) => s.transition);
  const [engagementLoading, setEngagementLoading] = React.useState(false);

  useEffect(() => {
    const loadChat = async () => {
      if (username) {
        try {
          const [participantProfile, post] = await Promise.all([
            profileService.getPublicProfile(username),
            resolvedPostId ? postService.getPostById(resolvedPostId) : Promise.resolve(undefined),
          ]);

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
    recordCompletedDeal({
      id: chatServiceRequest.id,
      serviceRequestId: chatServiceRequest.id,
      revieweeUsername: activeThread.providerUsername,
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
  }, [chatServiceRequest, activeThread, recordCompletedDeal]);

  const exitToMessages = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      router.push(`/post/${id}?fromProvider=1&fromChat=1` as any);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    await createOfficialEngagement(resolvedPostId);
  }, [resolvedPostId, createOfficialEngagement]);

  const handleCancelOfficialEngagement = useCallback(async () => {
    if (!chatServiceRequest) throw new Error('No active engagement');
    const isRequestPost = activeThread?.postContext?.tag === 'Request';
    const userIsProvider = activeThread?.postContext
      ? isCurrentUserProvider(activeThread.postContext.tag)
      : false;
    const action =
      isRequestPost && userIsProvider ? 'withdraw' : 'cancel';
    await transition(chatServiceRequest.id, action);
  }, [chatServiceRequest, activeThread, transition]);

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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={textColor} />
      </SafeAreaView>
    );
  }

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
