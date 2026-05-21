import type { FeaturedPost, ProviderPostsTab } from '../types';

export function filterProviderPosts(posts: FeaturedPost[], tab: ProviderPostsTab): FeaturedPost[] {
  if (tab === 'services') return posts.filter((p) => p.tag === 'Service');
  return posts.filter((p) => p.tag === 'Request');
}
