import { useNotificationsStore } from '../store/notificationsStore';
import type { NotificationsState } from '../store/notificationsStore';

export function useNotifications<T = NotificationsState>(selector?: (state: NotificationsState) => T): T {
  return useNotificationsStore(selector ?? ((s) => s as unknown as T));
}

export function getNotificationsState() {
  return useNotificationsStore.getState();
}

export default useNotifications;
