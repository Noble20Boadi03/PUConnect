import { normalizeUsernameSlug } from './normalizeUsername';

/** Builds the active chat route for a provider, optionally tied to a post. */
export function buildChatHref(rawUsername: string, postId?: string): string {
  const slug = normalizeUsernameSlug(rawUsername);
  if (postId) {
    return `/chat/${slug}?postId=${encodeURIComponent(postId)}`;
  }
  return `/chat/${slug}`;
}
