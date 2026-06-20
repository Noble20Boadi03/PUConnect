import { useExploreStore } from '../store/exploreStore';
import type { ExploreState } from '../store/exploreStore';

export function useExplore<T = ExploreState>(selector?: (state: ExploreState) => T): T {
  return useExploreStore(selector ?? ((s) => s as unknown as T));
}

export default useExplore;
