import { PROVIDER_PROFILES_MOCK } from '../constants/providerProfileMock';
import type { ProviderProfile } from '../types';
import { normalizeUsernameSlug } from './normalizeUsername';

export function getProviderProfileByUsername(raw: string): ProviderProfile | undefined {
  const slug = normalizeUsernameSlug(raw);
  return PROVIDER_PROFILES_MOCK[slug];
}
