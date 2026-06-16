import { create } from 'zustand';
import { postService } from '../services';
import type { PostDetail } from '../types';
import { mapDbPostToPostDetail } from '../lib';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface PostState {
  data: PostDetail | null;
  currentId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchPost: (id: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const usePostStore = create<PostState>((set, get) => ({
  data: null,
  currentId: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,

  fetchPost: async (id: string, forceRefresh = false) => {
    const { currentId, lastFetched, data } = get();
    const now = Date.now();

    // Check cache
    if (!forceRefresh && currentId === id && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }

    const hasExistingData = currentId === id && data !== null;

    set({
      isLoading: !hasExistingData && !forceRefresh,
      isRefreshing: forceRefresh || (hasExistingData && !forceRefresh),
      error: null,
    });

    try {
      const dbPost = await postService.getPostById(id);
      const postDetail = mapDbPostToPostDetail(dbPost);
      set({
        data: postDetail,
        currentId: id,
        lastFetched: now,
      });
    } catch (error) {
      console.error('Error fetching post detail:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load post',
        data: null,
      });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  clearCache: () => {
    set({ lastFetched: null });
  },
}));

export default usePostStore;
