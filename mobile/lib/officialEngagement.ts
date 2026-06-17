import type { ChatPostContext, MarketPostTag, OfficialCompletionPhase, OfficialEngagementStatus } from '../types';

export function isCurrentUserProvider(
  currentUserId: string,
  serviceRequest: { providerId: string } | null | undefined
): boolean {
  if (!serviceRequest) return false;
  return serviceRequest.providerId === currentUserId;
}

export function isCurrentUserRequester(
  currentUserId: string,
  serviceRequest: { requesterId: string } | null | undefined
): boolean {
  if (!serviceRequest) return false;
  return serviceRequest.requesterId === currentUserId;
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

export function providerPartyName(context: ChatPostContext, contactName: string, currentUserId: string, serviceRequest: { providerId: string } | null | undefined): string {
  return isCurrentUserProvider(currentUserId, serviceRequest) ? 'You' : contactName;
}

export function clientPartyName(context: ChatPostContext, contactName: string, currentUserId: string, serviceRequest: { requesterId: string } | null | undefined): string {
  return isCurrentUserRequester(currentUserId, serviceRequest) ? 'You' : contactName;
}
