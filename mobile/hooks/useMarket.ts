import { useMarketStore } from '../store/marketStore';
import type { MarketState } from '../store/marketStore';

export function useMarket<T = MarketState>(selector?: (state: MarketState) => T): T {
  return useMarketStore(selector ?? ((s) => s as unknown as T));
}

export default useMarket;
