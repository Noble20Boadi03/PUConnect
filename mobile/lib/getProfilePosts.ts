import { DEFAULT_OWNER_POSTS_MOCK } from '../constants/profilePostsMock';
import type { FeaturedPost, User } from '../types';
import { getProviderProfileByUsername } from './getProviderProfileByUsername';

/**
 * Posts shown on the signed-in user's profile (mock until listings API exists).
 */
export function getProfilePostsForUser(user: User | null | undefined): FeaturedPost[] {
  if (!user?.username) {
    return DEFAULT_OWNER_POSTS_MOCK;
  }
  const profile = getProviderProfileByUsername(user.username);
  return profile?.posts.length ? profile.posts : DEFAULT_OWNER_POSTS_MOCK;
}
