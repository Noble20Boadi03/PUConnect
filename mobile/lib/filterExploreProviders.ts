import type { ExploreCategoryFilter, ExploreProvider } from '../types/explore';

export function filterExploreProviders(
  providers: ExploreProvider[],
  filter: ExploreCategoryFilter,
  searchQuery?: string
): ExploreProvider[] {
  let result = [...providers];

  // First filter by category
  if (filter !== 'all') {
    result = result.filter((p) => p.categoryId === filter);
  }

  // Then filter by search query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((provider) => {
      const haystack = [
        provider.displayName,
        provider.handle,
        provider.skillTitle,
        ...provider.expertiseTags
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return result;
}
