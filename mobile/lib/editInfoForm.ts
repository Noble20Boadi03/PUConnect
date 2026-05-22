import {
  EDIT_INFO_SERVICE_OPTIONS,
  SERVICE_TAGS_BY_SERVICE_ID,
} from '../constants/editInfoServices';
import type { EditInfoServiceOption } from '../constants/editInfoServices';
import type { User } from '../types';

export function splitDisplayName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName?.trim()) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function getServiceOptionsByIds(ids: string[]): EditInfoServiceOption[] {
  const set = new Set(ids);
  return EDIT_INFO_SERVICE_OPTIONS.filter((s) => set.has(s.id));
}

export function getTagGroupsForServices(serviceIds: string[]): { serviceId: string; serviceTitle: string; tags: string[] }[] {
  return getServiceOptionsByIds(serviceIds).map((service) => ({
    serviceId: service.id,
    serviceTitle: service.title,
    tags: SERVICE_TAGS_BY_SERVICE_ID[service.id] ?? [],
  }));
}

export function pruneTagsForServices(selectedTags: string[], serviceIds: string[]): string[] {
  const allowed = new Set(
    serviceIds.flatMap((id) => SERVICE_TAGS_BY_SERVICE_ID[id] ?? [])
  );
  return selectedTags.filter((tag) => allowed.has(tag));
}

export function hasProviderSectionData(
  bio: string,
  serviceIds: string[],
  tags: string[] = []
): boolean {
  return bio.trim().length > 0 || serviceIds.length > 0 || tags.length > 0;
}

/** Provider onboarding requires bio and at least one campus service. */
export function isValidProviderProfile(bio: string, serviceIds: string[]): boolean {
  return bio.trim().length > 0 && serviceIds.length > 0;
}

export function validateProviderProfile(
  bio: string,
  serviceIds: string[]
): { valid: true } | { valid: false; message: string } {
  if (!bio.trim()) {
    return { valid: false, message: 'Add a bio to describe what you offer as a provider.' };
  }
  if (serviceIds.length === 0) {
    return { valid: false, message: 'Select at least one service you offer on campus.' };
  }
  return { valid: true };
}

export function getAccountTypeLabel(user: User | null | undefined, isProvider: boolean): string {
  if (user?.role === 'admin') {
    return isProvider ? 'Administrator, Provider' : 'Administrator';
  }
  return isProvider ? 'Regular, Provider' : 'Regular';
}
