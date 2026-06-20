import { useExploreStore } from '../store/exploreStore';
import type { ExploreState } from '../store/exploreStore';
import { useShallow } from 'zustand/react/shallow';

export function useExplore<T = ExploreState>(selector?: (state: ExploreState) => T): T {
  if (selector) {
    return useExploreStore(selector);
  }
  return useExploreStore(useShallow((s) => s as unknown as T));
}

export default useExplore;
