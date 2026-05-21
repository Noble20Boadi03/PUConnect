import { useCallback } from 'react';
import { runGuardedNavigation } from '../lib/guardedNavigation';

/**
 * Low-level guard helper. Prefer `useAppRouter()` for navigation and `GuardedPressable` for taps.
 */
export function useGuardedNavigation(cooldownMs?: number) {
  return useCallback(
    (key: string, action: () => void) => {
      runGuardedNavigation(key, action, cooldownMs);
    },
    [cooldownMs]
  );
}

export default useGuardedNavigation;
