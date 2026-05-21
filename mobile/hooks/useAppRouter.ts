import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { runGuardedBack, runGuardedNavigation, toNavigationKey } from '../lib/guardedNavigation';

/**
 * App-wide router with guarded navigation to prevent duplicate screens on rapid taps.
 *
 * - `push` uses `router.navigate()` (idempotent; won't stack the same route).
 * - `pushStack` uses `router.push()` when you intentionally need a new stack entry.
 * - All actions share a global cooldown so different targets cannot be spammed either.
 *
 * Use this instead of `useRouter` for user-driven navigation.
 */
export function useAppRouter() {
  const router = useRouter();

  const push = useCallback(
    (href: Href) => {
      const key = toNavigationKey(href);
      runGuardedNavigation(key, () => {
        router.navigate(href);
      });
    },
    [router]
  );

  const pushStack = useCallback(
    (href: Href) => {
      const key = `stack:${toNavigationKey(href)}`;
      runGuardedNavigation(key, () => {
        router.push(href);
      });
    },
    [router]
  );

  const replace = useCallback(
    (href: Href) => {
      const key = `replace:${toNavigationKey(href)}`;
      runGuardedNavigation(key, () => {
        router.replace(href);
      });
    },
    [router]
  );

  const back = useCallback(() => {
    runGuardedBack(() => {
      if (router.canGoBack()) {
        router.back();
      }
    });
  }, [router]);

  return useMemo(
    () => ({
      push,
      pushStack,
      replace,
      back,
      canGoBack: () => router.canGoBack(),
      dismiss: router.dismiss?.bind(router),
      dismissAll: router.dismissAll?.bind(router),
      setParams: router.setParams?.bind(router),
    }),
    [router, push, pushStack, replace, back]
  );
}

export default useAppRouter;
