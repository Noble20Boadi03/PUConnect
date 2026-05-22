import type { ExploreCategoryService, ExploreProvider, ExploreServiceTagFilter } from '../types/explore';

export function getExploreProvidersForService(
  providers: ExploreProvider[],
  service: ExploreCategoryService
): ExploreProvider[] {
  return providers.filter(
    (p) => p.categoryId === service.categoryId && p.serviceIds.includes(service.id)
  );
}

export function filterExploreProvidersByServiceTag(
  providers: ExploreProvider[],
  tagFilter: ExploreServiceTagFilter
): ExploreProvider[] {
  if (tagFilter === 'all') return providers;
  const key = tagFilter.toUpperCase();
  return providers.filter((p) =>
    p.expertiseTags.some((tag) => tag.toUpperCase() === key)
  );
}
