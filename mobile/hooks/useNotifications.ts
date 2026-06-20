import { useNotificationsStore } from '../store/notificationsStore';

export function useNotifications() {
  return useNotificationsStore();
}

export function getNotificationsState() {
  return useNotificationsStore.getState();
}

export default useNotifications;
