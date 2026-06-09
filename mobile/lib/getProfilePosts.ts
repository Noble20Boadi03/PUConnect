import { DEFAULT_OWNER_POSTS_MOCK } from '../constants/profilePostsMock';
import type { FeaturedPost, User } from '../types';
import { getProviderProfileByUsername } from './getProviderProfileByUsername';

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function personalizeOwnerPosts(
  posts: FeaturedPost[],
  user: User | null | undefined
): FeaturedPost[] {
  const name = user?.name?.trim();
  if (!name) return posts;
  const initials = initialsFromName(name);
  return posts.map((post) => ({
    ...post,
    authorName: name,
    authorInitials: initials,
  }));
}

/**
 * Posts shown on the signed-in user's profile (mock until listings API exists).
 */
export function getProfilePostsForUser(user: User | null | undefined): FeaturedPost[] {
  if (!user?.username) {
    return personalizeOwnerPosts(DEFAULT_OWNER_POSTS_MOCK, user);
  }
  const profile = getProviderProfileByUsername(user.username);
  return profile?.posts.length
    ? profile.posts
    : personalizeOwnerPosts(DEFAULT_OWNER_POSTS_MOCK, user);
}
