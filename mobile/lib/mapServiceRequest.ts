import type {
  DbServiceRequest,
  DbServiceRequestStatus,
  DbPost,
} from '../types/core';
import type { OfficialCompletionPhase, OfficialEngagementStatus, ChatPostContext } from '../types/chat';
import { parsePostPrice } from './mapDbPost';

export interface ServiceEngagementState {
  serviceRequestId: string | null;
  officialEngagementStatus: OfficialEngagementStatus;
  completionPhase: OfficialCompletionPhase;
  startedAt?: string;
  completionRequestedAt?: string;
  completedAt?: string;
}

function formatDisplayDate(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function mapServiceRequestToEngagement(
  request: DbServiceRequest | null | undefined
): ServiceEngagementState {
  if (!request) {
    return {
      serviceRequestId: null,
      officialEngagementStatus: 'none',
      completionPhase: 'none',
    };
  }

  let officialEngagementStatus: OfficialEngagementStatus = 'none';
  let completionPhase: OfficialCompletionPhase = 'none';

  switch (request.status as DbServiceRequestStatus) {
    case 'active':
    case 'pending_review':
      officialEngagementStatus = 'active';
      break;
    case 'pending':
      officialEngagementStatus = 'pending';
      break;
    case 'completed':
      officialEngagementStatus = 'completed';
      completionPhase = 'completed';
      break;
    case 'declined':
      officialEngagementStatus = 'declined';
      break;
    default:
      officialEngagementStatus = 'none';
  }

  if (request.status === 'pending_review') {
    completionPhase = 'pending_review';
  } else if (request.status === 'completed') {
    completionPhase = 'completed';
  }

  return {
    serviceRequestId: request.id,
    officialEngagementStatus,
    completionPhase,
    startedAt: formatDisplayDate(request.acceptedAt ?? request.createdAt),
    completionRequestedAt: formatDisplayDate(request.completionRequestedAt),
    completedAt: formatDisplayDate(request.completedAt),
  };
}

export function isActiveServiceStatus(status: DbServiceRequestStatus): boolean {
  return status === 'active' || status === 'pending_review' || status === 'pending';
}

export function serviceStatusLabel(status: DbServiceRequestStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'active':
      return 'Active';
    case 'pending_review':
      return 'Awaiting Confirmation';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'declined':
      return 'Declined';
    default:
      return status;
  }
}

export function serviceKindLabel(kind: DbServiceRequest['kind']): string {
  return kind === 'response' ? 'Official Response' : 'Official Request';
}

export function mapDbPostToChatPostContext(post: DbPost): ChatPostContext {
  const price = parsePostPrice(post.price);
  let priceLabel = '';
  if (price.kind === 'fixed') {
    priceLabel = `₵${price.amount}`;
  } else if (price.kind === 'range') {
    priceLabel = `₵${price.min}-₵${price.max}`;
  }
  
  return {
    postId: post.id,
    title: post.title,
    tag: post.tag,
    priceLabel,
    authorId: post.authorId
  };
}
