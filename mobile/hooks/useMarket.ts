import { useMarketStore } from '../store/marketStore';

export function useMarket() {
  return useMarketStore();
}

export default useMarket;
