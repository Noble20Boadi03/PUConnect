import { create } from 'zustand';
import { exploreService } from '../services';
import type { ExploreCategory, ExploreCategoryService } from '../types/explore';
import type { DbCategory, DbCategoryService } from '../types';

// Mapping functions
export const mapDbCategoryToExploreCategory = (dbCategory: DbCategory): ExploreCategory => ({
  id: dbCategory.id,
  title: dbCategory.title,
  pillLabel: dbCategory.pillLabel,
  tagline: dbCategory.tagline,
  description: dbCategory.description,
  imageUrl: dbCategory.imageUrl,
  accentColor: dbCategory.accentColor,
  iconName: dbCategory.iconName as any,
});

export const mapDbCategoryServiceToExploreCategoryService = (dbService: DbCategoryService): ExploreCategoryService => ({
  id: dbService.id,
  categoryId: dbService.categoryId,
  title: dbService.title,
  description: dbService.description,
  filterTags: dbService.filterTags,
});

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CategoryDetailData {
  category: ExploreCategory;
  services: ExploreCategoryService[];
}

interface CategoryDetailState {
  data: CategoryDetailData | null;
  currentId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchCategoryDetail: (id: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const useCategoryDetailStore = create<CategoryDetailState>((set, get) => ({
  data: null,
  currentId: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,

  fetchCategoryDetail: async (id, forceRefresh = false) => {
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
      const [categoryData, servicesData] = await Promise.all([
        exploreService.getCategoryById(id),
        exploreService.getCategoryServices(),
      ]);

      const mappedCategory = mapDbCategoryToExploreCategory(categoryData);
      const mappedServices = servicesData
        .filter(s => s.categoryId === id)
        .map(mapDbCategoryServiceToExploreCategoryService);

      set({
        data: { category: mappedCategory, services: mappedServices },
        currentId: id,
        lastFetched: now,
      });
    } catch (error) {
      console.error('Error fetching category data:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load category',
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

export default useCategoryDetailStore;
