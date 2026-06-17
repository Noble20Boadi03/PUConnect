import { create } from 'zustand';
import { postService, exploreService } from '../services';
import type { FeaturedPost, DbCategoryServiceWithCategory, ExploreCategoryService } from '../types';
import { mapDbPostToFeaturedPost } from '../lib';
import { mapDbCategoryServiceToExploreCategoryService } from './categoryDetailStore';

interface MarketState {
  posts: FeaturedPost[];
  popularServices: (DbCategoryServiceWithCategory & { service: ExploreCategoryService })[];
  popularServicesLoading: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  lastFetchedPopular: number | null;
  fetchPosts: (isRefresh?: boolean) => Promise<void>;
  fetchPopularServices: (isRefresh?: boolean) => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useMarketStore = create<MarketState>((set, get) => ({
  posts: [],
  popularServices: [],
  popularServicesLoading: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,
  lastFetchedPopular: null,
  
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

  fetchPopularServices: async (isRefresh = false) => {
    const { lastFetchedPopular, popularServices } = get();
    const now = Date.now();
    
    // Check cache
    if (!isRefresh && lastFetchedPopular && now - lastFetchedPopular < CACHE_TTL) {
      return;
    }

    const hasExistingData = popularServices.length > 0;

    set({ 
      popularServicesLoading: !isRefresh && !hasExistingData,
      error: null
    });

    try {
      const servicesData = await exploreService.getPopularServices();
      set({
        popularServices: servicesData.map(dbService => ({
          ...dbService,
          service: mapDbCategoryServiceToExploreCategoryService(dbService),
        })),
        lastFetchedPopular: now,
      });
    } catch (error) {
      console.error('Error fetching popular services:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load popular services' });
    } finally {
      set({ popularServicesLoading: false });
    }
  },
}));

export default useMarketStore;
