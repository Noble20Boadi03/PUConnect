import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { PROVIDER_PROFILE_STORAGE_KEY } from '../constants';
import { EXPLORE_PROVIDERS_MOCK } from '../constants/exploreMock';
import { getProviderProfileByUsername } from '../lib/getProviderProfileByUsername';
import { isValidProviderProfile } from '../lib/editInfoForm';
import type { ProviderProfileDraft, User } from '../types';

interface StoredProviderProfile extends ProviderProfileDraft {
  isProvider: boolean;
}

interface ProfileState {
  isProvider: boolean;
  providerBio: string;
  providerServiceIds: string[];
  providerTags: string[];
  hydrated: boolean;
  hydrate: (user: User | null | undefined) => Promise<void>;
  saveProviderProfile: (draft: ProviderProfileDraft) => Promise<void>;
  clearProviderProfile: () => Promise<void>;
}

async function readStored(): Promise<StoredProviderProfile | null> {
  try {
    const raw = await SecureStore.getItemAsync(PROVIDER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProviderProfile;
  } catch {
    return null;
  }
}

async function writeStored(data: StoredProviderProfile | null): Promise<void> {
  if (!data) {
    await SecureStore.deleteItemAsync(PROVIDER_PROFILE_STORAGE_KEY);
    return;
  }
  await SecureStore.setItemAsync(PROVIDER_PROFILE_STORAGE_KEY, JSON.stringify(data));
}

function seedFromMocks(user: User | null | undefined): ProviderProfileDraft | null {
  if (!user?.username) return null;
  const exploreProvider = EXPLORE_PROVIDERS_MOCK.find((p) => p.username === user.username);
  const profile = getProviderProfileByUsername(user.username);
  if (!exploreProvider && !profile?.bio) return null;

  const draft: ProviderProfileDraft = {
    bio: profile?.bio ?? '',
    serviceIds: exploreProvider ? [...exploreProvider.serviceIds] : [],
    tags: exploreProvider ? [...exploreProvider.expertiseTags] : [],
  };

  return isValidProviderProfile(draft.bio, draft.serviceIds) ? draft : null;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  isProvider: false,
  providerBio: '',
  providerServiceIds: [],
  providerTags: [],
  hydrated: false,

  hydrate: async (user) => {
    const stored = await readStored();
    if (stored?.isProvider && isValidProviderProfile(stored.bio, stored.serviceIds)) {
      set({
        isProvider: true,
        providerBio: stored.bio,
        providerServiceIds: stored.serviceIds,
        providerTags: stored.tags,
        hydrated: true,
      });
      return;
    }

    const seeded = seedFromMocks(user);
    if (seeded) {
      set({
        isProvider: true,
        providerBio: seeded.bio,
        providerServiceIds: seeded.serviceIds,
        providerTags: seeded.tags,
        hydrated: true,
      });
      await writeStored({ isProvider: true, ...seeded });
      return;
    }

    set({
      isProvider: false,
      providerBio: '',
      providerServiceIds: [],
      providerTags: [],
      hydrated: true,
    });
  },

  saveProviderProfile: async (draft) => {
    const valid = isValidProviderProfile(draft.bio, draft.serviceIds);
    if (!valid) {
      await get().clearProviderProfile();
      return;
    }
    await writeStored({ isProvider: true, ...draft });
    set({
      isProvider: true,
      providerBio: draft.bio,
      providerServiceIds: draft.serviceIds,
      providerTags: draft.tags,
    });
  },

  clearProviderProfile: async () => {
    await writeStored(null);
    set({
      isProvider: false,
      providerBio: '',
      providerServiceIds: [],
      providerTags: [],
    });
  },
}));

export default useProfileStore;
