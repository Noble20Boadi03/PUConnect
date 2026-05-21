import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { runGuardedBack, runGuardedNavigation, toNavigationKey } from '../lib/guardedNavigation';

/**
 * App-wide router with guarded push/replace/back to prevent duplicate screens on rapid taps.
 * Use this instead of `useRouter` for user-driven navigation.
 */
export function useAppRouter() {
  const router = useRouter();

  const push = useCallback(
    (href: Href) => {
      const key = toNavigationKey(href);
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
      replace,
      back,
      canGoBack: () => router.canGoBack(),
      dismiss: router.dismiss?.bind(router),
      dismissAll: router.dismissAll?.bind(router),
      setParams: router.setParams?.bind(router),
    }),
    [router, push, replace, back]
  );
}

export default useAppRouter;
