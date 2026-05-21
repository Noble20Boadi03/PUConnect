import type { Href } from 'expo-router';

/** Prevents duplicate navigations to the same route when buttons are spammed. */
const lockUntilByKey = new Map<string, number>();

const DEFAULT_COOLDOWN_MS = 450;
const BACK_COOLDOWN_MS = 320;

export function toNavigationKey(href: Href): string {
  if (typeof href === 'string') return href;
  if (typeof href === 'object' && href !== null) {
    const pathname =
      'pathname' in href && typeof href.pathname === 'string' ? href.pathname : '';
    const params = 'params' in href && href.params ? JSON.stringify(href.params) : '';
    return `${pathname}?${params}`;
  }
  return String(href);
}

export function runGuardedNavigation(
  key: string,
  action: () => void,
  cooldownMs = DEFAULT_COOLDOWN_MS
): void {
  const now = Date.now();
  const lockedUntil = lockUntilByKey.get(key) ?? 0;
  if (now < lockedUntil) return;

  lockUntilByKey.set(key, now + cooldownMs);
  action();
}

export function runGuardedBack(action: () => void): void {
  runGuardedNavigation('__back__', action, BACK_COOLDOWN_MS);
}
