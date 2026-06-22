import type { AdminTier } from '../types/common';

export type AdminSection = 'dashboard' | 'moderation' | 'directory' | 'content';

const SECTION_ACCESS: Record<AdminTier, AdminSection[]> = {
  super_admin: ['dashboard', 'moderation', 'directory', 'content'],
  moderator: ['moderation', 'content'],
  support: ['directory', 'moderation'],
};

export function getAdminSections(tier?: AdminTier | null): AdminSection[] {
  const resolved = tier ?? 'super_admin';
  return SECTION_ACCESS[resolved] ?? SECTION_ACCESS.super_admin;
}

export function canAccessSection(tier: AdminTier | null | undefined, section: AdminSection): boolean {
  return getAdminSections(tier).includes(section);
}

export function canBanUsers(tier?: AdminTier | null): boolean {
  const resolved = tier ?? 'super_admin';
  return resolved === 'super_admin' || resolved === 'moderator';
}
