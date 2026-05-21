import type { Href } from 'expo-router';

/** Prevents duplicate navigations when buttons are spammed. */
const lockUntilByKey = new Map<string, number>();

/** Blocks all navigations briefly so rapid taps cannot stack different routes. */
const DEFAULT_COOLDOWN_MS = 750;
const BACK_COOLDOWN_MS = 400;

let globalLockUntil = 0;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function scheduleGlobalLockRelease(until: number): void {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
  }
  const delay = Math.max(0, until - Date.now());
  releaseTimer = setTimeout(() => {
    releaseTimer = null;
    if (Date.now() >= globalLockUntil) {
      notifyListeners();
    }
  }, delay);
}

function acquireLocks(key: string, cooldownMs: number): boolean {
  const now = Date.now();
  if (now < globalLockUntil) return false;

  const keyLockedUntil = lockUntilByKey.get(key) ?? 0;
  if (now < keyLockedUntil) return false;

  const releaseAt = now + cooldownMs;
  globalLockUntil = Math.max(globalLockUntil, releaseAt);
  lockUntilByKey.set(key, releaseAt);
  scheduleGlobalLockRelease(globalLockUntil);
  notifyListeners();
  return true;
}

export function isNavigationLocked(): boolean {
  return Date.now() < globalLockUntil;
}

export function subscribeNavigationLock(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getNavigationLockSnapshot(): boolean {
  return isNavigationLocked();
}

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
  if (!acquireLocks(key, cooldownMs)) return;
  action();
}

export function runGuardedBack(action: () => void): void {
  runGuardedNavigation('__back__', action, BACK_COOLDOWN_MS);
}
