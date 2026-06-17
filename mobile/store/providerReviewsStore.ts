import { create } from 'zustand';
import { PROVIDER_REVIEWS_MOCK } from '../constants/providerReviewsMock';
import type { CompletedDeal, ProviderReview, ProviderReviewSummary } from '../types/review';

interface ProviderReviewsState {
  completedDeals: CompletedDeal[];
  submittedReviews: ProviderReview[];
  dismissedDealIds: string[];
  recordCompletedDeal: (deal: Omit<CompletedDeal, 'id'> & { id?: string }) => string;
  dismissReviewPrompt: (dealId: string) => void;
  submitReview: (review: Omit<ProviderReview, 'id' | 'isOwn'>) => ProviderReview;
  syncCompletedDealsFromRequests: (deals: CompletedDeal[]) => void;
  reset: () => void;
}

function dealId(revieweeUsername: string, postId: string) {
  return `${revieweeUsername}:${postId}`;
}

function computeSummary(reviews: ProviderReview[]): ProviderReviewSummary {
  if (reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    averageRating: Math.round((total / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

/** Pure selectors — use with store slices + useMemo, not inside useStore(selector). */
export function selectReviewsForProvider(
  submittedReviews: ProviderReview[],
  revieweeUsername: string
): ProviderReview[] {
  const mock = PROVIDER_REVIEWS_MOCK[revieweeUsername] ?? [];
  const own = submittedReviews.filter((r) => r.revieweeUsername === revieweeUsername);
  return [...own, ...mock];
}

export function selectSummaryForProvider(
  submittedReviews: ProviderReview[],
  revieweeUsername: string
): ProviderReviewSummary {
  return computeSummary(selectReviewsForProvider(submittedReviews, revieweeUsername));
}

export function selectCanReviewProvider(
  completedDeals: CompletedDeal[],
  submittedReviews: ProviderReview[],
  revieweeUsername: string
): boolean {
  return completedDeals.some((deal) => {
    if (deal.revieweeUsername !== revieweeUsername) return false;
    return !submittedReviews.some(
      (r) =>
        r.revieweeUsername === revieweeUsername &&
        (r.serviceTitle === deal.postTitle || deal.serviceRequestId === deal.id)
    );
  });
}

export function selectReviewableDeal(
  completedDeals: CompletedDeal[],
  submittedReviews: ProviderReview[],
  revieweeUsername: string,
  postId?: string,
  serviceRequestId?: string
): CompletedDeal | undefined {
  if (serviceRequestId) {
    return completedDeals.find(
      (deal) =>
        deal.serviceRequestId === serviceRequestId ||
        deal.id === serviceRequestId
    );
  }
  if (postId) {
    return completedDeals.find(
      (deal) => deal.revieweeUsername === revieweeUsername && deal.postId === postId
    );
  }
  return completedDeals.find(
    (deal) =>
      deal.revieweeUsername === revieweeUsername &&
      !submittedReviews.some(
        (r) =>
          r.revieweeUsername === revieweeUsername &&
          (r.serviceTitle === deal.postTitle || deal.serviceRequestId === deal.id)
      )
  );
}

export const useProviderReviewsStore = create<ProviderReviewsState>((set) => ({
  completedDeals: [],
  submittedReviews: [],
  dismissedDealIds: [],

  recordCompletedDeal: (deal) => {
    const id = deal.id ?? deal.serviceRequestId ?? dealId(deal.revieweeUsername, deal.postId);
    const entry: CompletedDeal = { ...deal, id };
    set((state) => {
      if (state.completedDeals.some((d) => d.id === id)) {
        return state;
      }
      return { completedDeals: [...state.completedDeals, entry] };
    });
    return id;
  },

  dismissReviewPrompt: (dealId) => {
    set((state) => ({
      dismissedDealIds: state.dismissedDealIds.includes(dealId)
        ? state.dismissedDealIds
        : [...state.dismissedDealIds, dealId],
    }));
  },

  submitReview: (review) => {
    const id = `user-rev-${Date.now()}`;
    const entry: ProviderReview = { ...review, id, isOwn: true };
    set((state) => ({
      submittedReviews: [...state.submittedReviews, entry],
    }));
    return entry;
  },

  syncCompletedDealsFromRequests: (deals) => {
    set((state) => {
      const merged = [...state.completedDeals];
      for (const deal of deals) {
        if (!merged.some((d) => d.id === deal.id)) {
          merged.push(deal);
        }
      }
      return { completedDeals: merged };
    });
  },
  
  reset: () => {
    set({
      completedDeals: [],
      submittedReviews: [],
      dismissedDealIds: [],
    });
  },
}));

export default useProviderReviewsStore;
