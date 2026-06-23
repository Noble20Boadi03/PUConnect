import type { ExploreCategoryId, ExploreCategoryService } from '../types/explore';
import { useExploreStore } from '../store/exploreStore';

export interface EditInfoServiceOption {
  id: string;
  title: string;
  categoryId: ExploreCategoryId;
  categoryLabel: string;
  /** Tags a provider can select when offering this service. */
  tags: string[];
}

export function getEditInfoServiceOptions(): EditInfoServiceOption[] {
  const categories = useExploreStore.getState().categories;
  const categoryLabelById = Object.fromEntries(
    categories.map((c) => [c.id, c.pillLabel])
  );

  return categories
    .flatMap((c) => c.services || [])
    .map((service) => ({
      id: service.id,
      title: service.title,
      categoryId: service.categoryId,
      categoryLabel: categoryLabelById[service.categoryId],
      tags: [...(service.filterTags || [])],
    }))
    .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel) || a.title.localeCompare(b.title));
}

export function getServiceTagsByServiceId(): Record<string, string[]> {
  const options = getEditInfoServiceOptions();
  return Object.fromEntries(options.map((s) => [s.id, s.tags]));
}

export function getEditInfoServicesByCategory() {
  const categories = useExploreStore.getState().categories;
  const options = getEditInfoServiceOptions();
  
  return categories.map((category) => ({
    categoryId: category.id,
    categoryLabel: category.pillLabel,
    services: options.filter((s) => s.categoryId === category.id),
  })).filter((group) => group.services.length > 0);
}
