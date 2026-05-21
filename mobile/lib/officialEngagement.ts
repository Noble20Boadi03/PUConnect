import type { ChatPostContext, MarketPostTag, OfficialCompletionPhase, OfficialEngagementStatus } from '../types';

/** Responder on a request listing; service owner on a service listing. */
export function isCurrentUserProvider(tag: MarketPostTag): boolean {
  return tag === 'Request';
}

export function officialEngagementKindLabel(tag: MarketPostTag): string {
  return tag === 'Request' ? 'Official Response' : 'Official Request';
}

export function engagementStatusLabel(
  status: OfficialEngagementStatus,
  completionPhase: OfficialCompletionPhase
): string {
  if (status === 'completed' || completionPhase === 'completed') return 'Completed';
  if (completionPhase === 'pending_review') return 'Awaiting Confirmation';
  if (status === 'active') return 'Active';
  return 'Not started';
}

export function providerPartyName(context: ChatPostContext, contactName: string): string {
  return isCurrentUserProvider(context.tag) ? 'You' : contactName;
}

export function clientPartyName(context: ChatPostContext, contactName: string): string {
  return isCurrentUserProvider(context.tag) ? contactName : 'You';
}
