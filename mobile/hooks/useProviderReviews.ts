import { useProviderReviewsStore } from '../store/providerReviewsStore';
import type { ProviderReviewsState } from '../store/providerReviewsStore';
import { useShallow } from 'zustand/react/shallow';

export function useProviderReviews<T = ProviderReviewsState>(selector?: (state: ProviderReviewsState) => T): T {
  if (selector) {
    return useProviderReviewsStore(selector);
  }
  return useProviderReviewsStore(useShallow((s) => s as unknown as T));
}

export {
  selectReviewsForProvider,
  selectSummaryForProvider,
  selectCanReviewProvider,
  selectReviewableDeal,
  selectIsEligibleForReview,
} from '../store/providerReviewsStore';

export default useProviderReviews;
