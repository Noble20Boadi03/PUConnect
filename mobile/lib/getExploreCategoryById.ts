import { useExploreStore } from '../store/exploreStore';
import type { ExploreCategory, ExploreCategoryId, ExploreCategoryService } from '../types/explore';

export function getExploreCategoryById(
  id: string | undefined
): ExploreCategory | undefined {
  if (!id) return undefined;
  const categories = useExploreStore.getState().categories;
  return categories.find((c) => c.id === id);
}

export function getExploreCategoryServices(
  categoryId: ExploreCategoryId | string | undefined
): ExploreCategoryService[] {
  if (!categoryId) return [];
  const category = getExploreCategoryById(categoryId);
  return category?.services ?? [];
}

export function getExploreCategoryServiceById(
  categoryId: string | undefined,
  serviceId: string | undefined
): ExploreCategoryService | undefined {
  if (!categoryId || !serviceId) return undefined;
  return getExploreCategoryServices(categoryId).find((s) => s.id === serviceId);
}
