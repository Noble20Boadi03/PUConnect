import type { MarketPostTag } from './market';

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
