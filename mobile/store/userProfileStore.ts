import { create } from 'zustand';
import { profileService } from '../services';
import { mapDbPostToFeaturedPost } from '../lib';
import type { FeaturedPost } from '../types';
import type { DbReview } from '../services/reviewService';

interface UserProfileState {
  posts: FeaturedPost[];
  receivedReviews: DbReview[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProfile: (username: string, isRefresh?: boolean) => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  posts: [],
  receivedReviews: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,
  
  fetchProfile: async (username: string, isRefresh = false) => {
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
      const profile = await profileService.getPublicProfile(username);
      const apiPosts = Array.isArray(profile?.posts) ? profile.posts : [];
      const reviews = Array.isArray(profile?.receivedReviews) ? profile.receivedReviews : [];
      
      set({
        posts: apiPosts.map(mapDbPostToFeaturedPost),
        receivedReviews: reviews,
        lastFetched: now,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load data',
        posts: [],
        receivedReviews: []
      });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },
}));

export default useUserProfileStore;
