import { EXPLORE_CATEGORIES_MOCK } from '../constants/exploreMock';
import { EXPLORE_CATEGORY_SERVICES_MOCK } from '../constants/exploreCategoryServicesMock';
import type { ExploreCategory, ExploreCategoryId, ExploreCategoryService } from '../types/explore';

export function getExploreCategoryById(
  id: string | undefined
): ExploreCategory | undefined {
  if (!id) return undefined;
  return EXPLORE_CATEGORIES_MOCK.find((c) => c.id === id);
}

export function getExploreCategoryServices(
  categoryId: ExploreCategoryId | string | undefined
): ExploreCategoryService[] {
  if (!categoryId) return [];
  const services = EXPLORE_CATEGORY_SERVICES_MOCK[categoryId as ExploreCategoryId];
  return services ?? [];
}

export function getExploreCategoryServiceById(
  categoryId: string | undefined,
  serviceId: string | undefined
): ExploreCategoryService | undefined {
  if (!categoryId || !serviceId) return undefined;
  return getExploreCategoryServices(categoryId).find((s) => s.id === serviceId);
}
