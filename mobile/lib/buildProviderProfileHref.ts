import { normalizeUsernameSlug } from './normalizeUsername';

/** Same route used when opening a provider from a service post detail page. */
export function buildProviderProfileHref(rawUsername: string): string {
  return `/provider/${normalizeUsernameSlug(rawUsername)}`;
}
