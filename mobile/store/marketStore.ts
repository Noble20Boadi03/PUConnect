import { create } from 'zustand';
import { postService } from '../services';
import type { FeaturedPost } from '../types';
import { mapDbPostToFeaturedPost } from '../lib';

interface MarketState {
  posts: FeaturedPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchPosts: (isRefresh?: boolean) => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useMarketStore = create<MarketState>((set, get) => ({
  posts: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,
  
  fetchPosts: async (isRefresh = false) => {
    const { lastFetched, posts } = get();
    const now = Date.now();
    
    // Check cache
    if (!isRefresh && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }

    const hasExistingData = posts.length > 0;

    set({ 
      isLoading: !isRefresh && !hasExistingData, 
      isRefreshing: isRefresh,
      error: null
    });

    try {
      const postsData = await postService.getPosts();
      set({
        posts: postsData.map(mapDbPostToFeaturedPost),
        lastFetched: now,
      });
    } catch (error) {
      console.error('Error fetching market posts:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load data' });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },
}));

export default useMarketStore;
