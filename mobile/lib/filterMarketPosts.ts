import type { FeaturedPost, MarketFilter } from '../types';

export function filterMarketPosts(
  posts: readonly FeaturedPost[],
  filter: MarketFilter
): FeaturedPost[] {
  switch (filter) {
    case 'services':
      return posts.filter((post) => post.tag === 'Service');
    case 'requests':
      return posts.filter((post) => post.tag === 'Request');
    default:
      return [...posts];
  }
}
