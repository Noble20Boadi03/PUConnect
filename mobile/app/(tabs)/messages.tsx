import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { MessagesInboxView } from '../../components/Messages';
import { MESSAGES_INBOX_MOCK } from '../../constants/messagesListMock';
import { buildChatHref } from '../../lib';
import type { ConversationPreview } from '../../types';

export default function MessagesScreen() {
  const router = useRouter();

  const handleConversationPress = useCallback(
    (conversation: ConversationPreview) => {
      router.push(
        buildChatHref(conversation.providerUsername, conversation.postId) as any
      );
    },
    [router]
  );

  return (
    <MessagesInboxView
      conversations={MESSAGES_INBOX_MOCK}
      onConversationPress={handleConversationPress}
    />
  );
}
