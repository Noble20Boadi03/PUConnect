import { useProviderReviewsStore } from '../store/providerReviewsStore';

export function useProviderReviews() {
  return useProviderReviewsStore();
}

export {
  selectReviewsForProvider,
  selectSummaryForProvider,
  selectCanReviewProvider,
  selectReviewableDeal,
  selectIsEligibleForReview,
} from '../store/providerReviewsStore';

export default useProviderReviews;
