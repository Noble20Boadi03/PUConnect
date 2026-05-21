import type { ExploreCategoryFilter, ExploreProvider } from '../types/explore';

export function filterExploreProviders(
  providers: ExploreProvider[],
  filter: ExploreCategoryFilter
): ExploreProvider[] {
  if (filter === 'all') return providers;
  return providers.filter((p) => p.categoryId === filter);
}
