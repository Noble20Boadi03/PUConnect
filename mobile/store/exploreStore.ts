import { create } from 'zustand';
import { exploreService } from '../services';
import type { ExploreCategory, ExploreProvider } from '../types';
import { DbCategory, User } from '../types';

const mapDbCategoryToExploreCategory = (dbCategory: any): ExploreCategory => ({
  id: dbCategory.id,
  title: dbCategory.title,
  pillLabel: dbCategory.pillLabel,
  tagline: dbCategory.tagline,
  description: dbCategory.description,
  imageUrl: dbCategory.imageUrl,
  accentColor: dbCategory.accentColor,
  iconName: dbCategory.iconName as any,
  services: dbCategory.services?.map((s: any) => ({
    id: s.id,
    categoryId: s.categoryId,
    title: s.title,
    description: s.description,
    filterTags: s.filterTags || [],
  })) || [],
});

const mapUserToExploreProvider = (user: any): ExploreProvider => {
  let services: Array<{ title: string }> = user.services ?? [];
  // For mocks / static, if service details aren't populated, we rely on the dynamic store mapping
  // We'll leave skillTitle to fall back if services are missing.
  const serviceNames = services.map((s) => s.title).join(', ');
  const skillTitle =
    serviceNames ||
    (user as any).skillTitle ||
    'Provider';

  return {
    username: user.username,
    displayName: user.name,
    handle: user.username,
    avatarUrl: user.avatarUrl,
    categoryId: (user as any).categoryId || 'academics',
    skillTitle,
    expertiseTags: (user as any).expertiseTags || [],
    serviceIds: (user as any).serviceIds || [],
    averageRating: user.averageRating ?? 0,
    reviewCount: user.reviewCount ?? 0,
  };
};

export interface ExploreState {
  categories: ExploreCategory[];
  providers: ExploreProvider[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchExploreData: (isRefresh?: boolean) => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useExploreStore = create<ExploreState>((set, get) => ({
  categories: [],
  providers: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,
  
  fetchExploreData: async (isRefresh = false) => {
    const { lastFetched, categories, providers } = get();
    const now = Date.now();
    
    // Check cache
    if (!isRefresh && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }

    const hasExistingData = categories.length > 0 || providers.length > 0;

    set({ 
      isLoading: !isRefresh && !hasExistingData, 
      isRefreshing: isRefresh,
      error: null
    });

    try {
      const [categoriesData, providersData] = await Promise.all([
        exploreService.getCategories(),
        exploreService.getExploreProviders(),
      ]);

      set({
        categories: categoriesData.map(mapDbCategoryToExploreCategory),
        providers: providersData.map(mapUserToExploreProvider),
        lastFetched: now,
      });
    } catch (error) {
      console.error('Error fetching explore data:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load data' });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },
}));

export default useExploreStore;
