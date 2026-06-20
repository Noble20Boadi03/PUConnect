import { useNotificationsStore } from '../store/notificationsStore';
import type { NotificationsState } from '../store/notificationsStore';
import { useShallow } from 'zustand/react/shallow';

export function useNotifications<T = NotificationsState>(selector?: (state: NotificationsState) => T): T {
  if (selector) {
    return useNotificationsStore(selector);
  }
  return useNotificationsStore(useShallow((s) => s as unknown as T));
}

export function getNotificationsState() {
  return useNotificationsStore.getState();
}

export default useNotifications;
