import type { MarketIconName, MarketPostTag } from './market';

export type ChatMessageKind = 'sent' | 'received';

export interface ChatMessage {
  id: string;
  kind: ChatMessageKind;
  text: string;
  /** Display time, e.g. "10:24 AM" */
  time: string;
}

export interface ChatDateGroup {
  /** Uppercase label, e.g. "MAY 13" */
  dateLabel: string;
  messages: ChatMessage[];
}

export interface ChatPostContext {
  postId: string;
  title: string;
  tag: MarketPostTag;
}

export interface ChatParticipant {
  displayName: string;
  handle: string;
  avatarUrl: string;
}

/** Active conversation thread (pure UI mock). */
export interface ChatThread {
  providerUsername: string;
  participant: ChatParticipant;
  postContext?: ChatPostContext;
  dateGroups: ChatDateGroup[];
}

export interface ConversationContextLine {
  icon: MarketIconName;
  text: string;
}

/** Row on the Messages inbox screen. */
export interface ConversationPreview {
  id: string;
  providerUsername: string;
  participant: ChatParticipant;
  contextLine?: ConversationContextLine;
  lastMessage: string;
  timestamp: string;
  postId?: string;
  unread?: boolean;
  unreadCount?: number;
  isOnline?: boolean;
  isPinned?: boolean;
}
