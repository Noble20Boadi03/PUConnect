import React, { useCallback } from 'react';

import { MessagesInboxView } from '../../components/Messages';
import { MESSAGES_INBOX_MOCK } from '../../constants/messagesListMock';
import { buildChatHref } from '../../lib';
import { useAppRouter } from '../../hooks';
import type { ConversationPreview } from '../../types';

export default function MessagesScreen() {
  const router = useAppRouter();

  const handleConversationPress = useCallback(
    (conversation: ConversationPreview) => {
      router.push(buildChatHref(conversation.providerUsername, conversation.postId) as any);
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
