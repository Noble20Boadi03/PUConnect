import { useSyncExternalStore } from 'react';
import {
  getNavigationLockSnapshot,
  subscribeNavigationLock,
} from '../lib/guardedNavigation';

/** True while a guarded navigation is in its cooldown window. */
export function useNavigationLock(): boolean {
  return useSyncExternalStore(
    subscribeNavigationLock,
    getNavigationLockSnapshot,
    () => false
  );
}

export default useNavigationLock;
