import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postService, exploreService } from '../services';
import type { FeaturedPost, DbCategoryServiceWithCategory, ExploreCategoryService, MarketFilter } from '../types';
import { mapDbPostToFeaturedPost } from '../lib';
import { mapDbCategoryServiceToExploreCategoryService } from './categoryDetailStore';

const RECENTLY_VIEWED_KEY = 'market_recently_viewed_ids';

export interface MarketState {
  posts: FeaturedPost[];
  popularServices: (DbCategoryServiceWithCategory & { service: ExploreCategoryService })[];
  popularServicesLoading: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  lastFetched: number | null;
  lastFetchedPopular: number | null;
  currentPage: number;
  hasMore: boolean;
  activeFilter: MarketFilter;
  searchQuery: string;
  recentlyViewedIds: string[];
  fetchPosts: (isRefresh?: boolean) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  setFilter: (filter: MarketFilter) => Promise<void>;
  fetchPopularServices: (isRefresh?: boolean) => Promise<void>;
  reset: () => void;
  invalidateCache: () => void;
  removePost: (postId: string) => void;
  trackPostView: (postId: string) => Promise<void>;
  initializeRecentlyViewed: () => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const filterToType = (filter: MarketFilter): 'service' | 'request' | undefined => {
  switch (filter) {
    case 'services':
      return 'service';
    case 'requests':
      return 'request';
    default:
      return undefined;
  }
};

export const useMarketStore = create<MarketState>((set, get) => ({
  posts: [],
  popularServices: [],
  popularServicesLoading: false,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  lastFetched: null,
  lastFetchedPopular: null,
  currentPage: 1,
  hasMore: false,
  activeFilter: 'all',
  searchQuery: '',
  recentlyViewedIds: [],
  
  initializeRecentlyViewed: async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        set({ recentlyViewedIds: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  },

  trackPostView: async (postId: string) => {
    set((state) => {
      const newIds = [postId, ...state.recentlyViewedIds.filter(id => id !== postId)].slice(0, 5);
      (async () => {
        try {
          await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newIds));
        } catch (error) {
          console.error('Error saving recently viewed:', error);
        }
      })();
      return { recentlyViewedIds: newIds };
    });
  },

  fetchPosts: async (isRefresh = false) => {
    const { lastFetched, activeFilter, searchQuery } = get();
    const now = Date.now();
    const type = filterToType(activeFilter);
    const hasFilters = activeFilter !== 'all' || !!searchQuery;
    
    // Check cache only if no filters
    if (!isRefresh && !hasFilters && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }

    const hasExistingData = get().posts.length > 0;

    set({ 
      isLoading: !isRefresh && !hasExistingData, 
      isRefreshing: isRefresh,
      error: null,
      currentPage: 1,
    });

    try {
      const response = await postService.getPosts({ 
        type, 
        search: searchQuery || undefined,
        page: 1,
        limit: 10
      });
      set({
        posts: response.posts.map(mapDbPostToFeaturedPost),
        hasMore: response.hasMore,
        currentPage: 1,
        lastFetched: hasFilters ? null : now, // Don't cache filtered/search results
      });
    } catch (error) {
      console.error('Error fetching market posts:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load data' });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  loadMorePosts: async () => {
    const { currentPage, hasMore, isLoading, isLoadingMore, activeFilter, searchQuery } = get();
    if (!hasMore || isLoading || isLoadingMore) return;

    const type = filterToType(activeFilter);

    set({ isLoadingMore: true });

    try {
      const response = await postService.getPosts({ 
        type, 
        search: searchQuery || undefined,
        page: currentPage + 1,
        limit: 10
      });
      set((state) => ({
        posts: [...state.posts, ...response.posts.map(mapDbPostToFeaturedPost)],
        hasMore: response.hasMore,
        currentPage: currentPage + 1,
      }));
    } catch (error) {
      console.error('Error loading more posts:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load more posts' });
    } finally {
      set({ isLoadingMore: false });
    }
  },

  searchPosts: async (query: string) => {
    set({ searchQuery: query });
    await get().fetchPosts(true);
  },

  setFilter: async (filter: MarketFilter) => {
    set({ activeFilter: filter });
    await get().fetchPosts(true);
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
  
  reset: () => {
    set({
      posts: [],
      popularServices: [],
      popularServicesLoading: false,
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: null,
      lastFetched: null,
      lastFetchedPopular: null,
      currentPage: 1,
      hasMore: false,
      activeFilter: 'all',
      searchQuery: '',
    });
  },

  invalidateCache: () => {
    set({ lastFetched: null });
  },

  removePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },
}));

export default useMarketStore;
