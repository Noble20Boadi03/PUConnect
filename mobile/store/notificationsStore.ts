import { create } from 'zustand';
import { NOTIFICATIONS_MOCK, type AppNotification } from '../constants/notificationsMock';

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

function countUnread(items: AppNotification[]): number {
  return items.filter((n) => !n.read).length;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: NOTIFICATIONS_MOCK.map((n) => ({ ...n })),
  unreadCount: countUnread(NOTIFICATIONS_MOCK),
  markRead: (id) =>
    set((state) => {
      const items = state.items.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { items, unreadCount: countUnread(items) };
    }),
  markAllRead: () =>
    set((state) => {
      const items = state.items.map((n) => ({ ...n, read: true }));
      return { items, unreadCount: 0 };
    }),
}));
