import type { ServicePost } from '../types';
import { getProviderProfileByUsername } from './getProviderProfileByUsername';
import { normalizeUsernameSlug } from './normalizeUsername';

/** Service listings offered by a provider (for request-service picker in chat). */
export function getProviderServices(rawUsername: string): ServicePost[] {
  const profile = getProviderProfileByUsername(normalizeUsernameSlug(rawUsername));
  if (!profile) return [];
  return profile.posts.filter((p): p is ServicePost => p.tag === 'Service');
}
