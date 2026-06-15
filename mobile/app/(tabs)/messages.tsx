import React, { useCallback, useEffect } from 'react';

import { MessagesInboxView } from '../../components/Messages';
import { buildChatHref } from '../../lib';
import { useAppRouter } from '../../hooks';
import { useChat } from '../../hooks/useChat';
import type { ConversationPreview } from '../../types';

export default function MessagesScreen() {
  const router = useAppRouter();
  const { conversations, fetchConversations, subscribeToMessages } = useChat();

  useEffect(() => {
    fetchConversations();
    subscribeToMessages();
  }, [fetchConversations, subscribeToMessages]);

  const handleConversationPress = useCallback(
    (conversation: ConversationPreview) => {
      router.push(buildChatHref(conversation.providerUsername, conversation.postId) as any);
    },
    [router]
  );

  const mappedConversations: ConversationPreview[] = conversations.map(c => ({
    id: c.user.id,
    providerUsername: c.user.username,
    participant: {
      displayName: c.user.name,
      handle: `@${c.user.username}`,
      avatarUrl: c.user.avatarUrl || '',
    },
    lastMessage: c.lastMessage.content,
    timestamp: new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    unread: !c.lastMessage.isRead,
  }));

  return (
    <MessagesInboxView
      conversations={mappedConversations}
      onConversationPress={handleConversationPress}
    />
  );
}
