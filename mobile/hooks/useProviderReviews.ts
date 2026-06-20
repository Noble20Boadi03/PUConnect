import { useProviderReviewsStore } from '../store/providerReviewsStore';
import type { ProviderReviewsState } from '../store/providerReviewsStore';

export function useProviderReviews<T = ProviderReviewsState>(selector?: (state: ProviderReviewsState) => T): T {
  return useProviderReviewsStore(selector ?? ((s) => s as unknown as T));
}

export {
  selectReviewsForProvider,
  selectSummaryForProvider,
  selectCanReviewProvider,
  selectReviewableDeal,
  selectIsEligibleForReview,
} from '../store/providerReviewsStore';

export default useProviderReviews;
