import { create } from 'zustand';
import { profileService } from '../services';
import type { ProviderProfile } from '../types';
import { mapApiProfileToProviderProfile } from '../lib';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ProviderProfileState {
  data: ProviderProfile | null;
  currentId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProviderProfile: (username: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const useProviderProfileStore = create<ProviderProfileState>((set, get) => ({
  data: null,
  currentId: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,

  fetchProviderProfile: async (username: string, forceRefresh = false) => {
    const { currentId, lastFetched, data } = get();
    const now = Date.now();

    // Check cache
    if (!forceRefresh && currentId === username && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }

    const hasExistingData = currentId === username && data !== null;

    set({
      isLoading: !hasExistingData && !forceRefresh,
      isRefreshing: forceRefresh || (hasExistingData && !forceRefresh),
      error: null,
    });

    try {
      const apiProfile = await profileService.getPublicProfile(username);
      const providerProfile = mapApiProfileToProviderProfile(apiProfile);
      set({
        data: providerProfile,
        currentId: username,
        lastFetched: now,
      });
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load profile',
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

export default useProviderProfileStore;
