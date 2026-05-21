import type { MarketIconName, MarketPostTag } from './market';

export type ChatMessageKind = 'sent' | 'received' | 'system';

/** PuConnect-tracked official action tied to the contextual listing (service or request). */
export type OfficialEngagementStatus = 'none' | 'active' | 'completed';

/** Two-party completion: provider requests, client reviews and confirms. */
export type OfficialCompletionPhase = 'none' | 'pending_review' | 'completed';

/** @deprecated Use OfficialEngagementStatus */
export type OfficialHireStatus = OfficialEngagementStatus;

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
  priceLabel?: string;
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
