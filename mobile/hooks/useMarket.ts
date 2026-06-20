import { useMarketStore } from '../store/marketStore';
import type { MarketState } from '../store/marketStore';
import { useShallow } from 'zustand/react/shallow';

export function useMarket<T = MarketState>(selector?: (state: MarketState) => T): T {
  if (selector) {
    return useMarketStore(selector);
  }
  return useMarketStore(useShallow((s) => s as unknown as T));
}

export default useMarket;
