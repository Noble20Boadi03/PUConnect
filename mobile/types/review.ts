/** A review left for a provider after a completed official undertaking. */
export interface ProviderReview {
  id: string;
  /** Provider slug (reviewee), e.g. jordanp */
  revieweeUsername: string;
  authorDisplayName: string;
  authorInitials: string;
  /** 1–5 */
  rating: number;
  comment: string;
  serviceTitle: string;
  createdAt: string;
  /** Written by the signed-in user in this session. */
  isOwn?: boolean;
}

export interface ProviderReviewSummary {
  averageRating: number;
  reviewCount: number;
}

/** Completed undertaking that unlocks an optional review for the client. */
export interface CompletedDeal {
  id: string;
  revieweeUsername: string;
  postId: string;
  postTitle: string;
  completedAt: string;
}
