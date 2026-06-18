import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { MessagesInboxView } from '../../components/Messages';
import { buildChatHref } from '../../lib';
import { useAppRouter } from '../../hooks';
import { useAuthStore, useChatStore } from '../../store';
import { useChat } from '../../hooks/useChat';
import type { ConversationPreview } from '../../types';

export default function MessagesScreen() {
  const router = useAppRouter();
  const { user: currentUser } = useAuthStore();
  const { conversations, fetchConversations, subscribeToMessages, isRefreshing, isLoadingMoreConversations, loadMoreConversations } = useChat();
  const { fetchMessages } = useChatStore();

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      subscribeToMessages();
    }, [fetchConversations, subscribeToMessages])
  );

  const handleConversationPress = useCallback(
    (conversation: ConversationPreview) => {
      router.push(buildChatHref(conversation.providerUsername, conversation.postId) as any);
    },
    [router]
  );

  const handleConversationPressIn = useCallback(
    (conversation: ConversationPreview) => {
      // Prefetch messages when user starts pressing the conversation
      fetchMessages(
        conversation.providerUsername,
        conversation.participant,
        conversation.postId ? { postId: conversation.postId, title: '', tag: 'Service', priceLabel: '', authorId: '' } : undefined
      );
    },
    [fetchMessages]
  );

  const mappedConversations: ConversationPreview[] = conversations.map(c => ({
    id: c.user.id,
    providerUsername: c.user.username,
    participant: {
      displayName: c.user.name,
      handle: `@${c.user.username}`,
      avatarUrl: c.user.avatarUrl || '',
    },
    participantRole: c.user.role,
    lastMessage: c.lastMessage.content,
    timestamp: new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    unread: !c.lastMessage.isRead && c.lastMessage.receiverId === currentUser?.id,
    postId: c.lastMessage.post?.id,
    isMuted: c.isMuted,
    isPinned: c.isPinned,
  }));

  return (
    <MessagesInboxView
      conversations={mappedConversations}
      onConversationPress={handleConversationPress}
      onConversationPressIn={handleConversationPressIn}
      isRefreshing={isRefreshing}
      onRefresh={fetchConversations}
      isLoadingMore={isLoadingMoreConversations}
      onLoadMore={loadMoreConversations}
    />
  );
}
