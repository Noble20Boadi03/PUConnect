import type { FeaturedPost, MarketFilter } from '../types';

export function filterMarketPosts(
  posts: readonly FeaturedPost[],
  filter: MarketFilter,
  searchQuery?: string
): FeaturedPost[] {
  let result = [...posts];

  // First filter by type
  switch (filter) {
    case 'services':
      result = result.filter((post) => post.tag === 'Service');
      break;
    case 'requests':
      result = result.filter((post) => post.tag === 'Request');
      break;
  }

  // Then filter by search query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((post) => {
      const haystack = [post.title, post.description, post.authorName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return result;
}
