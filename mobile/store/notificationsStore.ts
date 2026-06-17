import { create } from 'zustand';
import { notificationService, type BackendNotification } from '../services/notificationService';
import type { AppNotification } from '../constants/notificationsMock';
import { getSocket } from '../lib/socket';
import { useAuthStore } from './authStore';

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchNotifications: (isRefresh?: boolean) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
  reset: () => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function toAppNotification(backend: BackendNotification): AppNotification {
  return {
    id: backend.id,
    kind: backend.kind,
    title: backend.title,
    body: backend.body,
    time: formatTime(backend.createdAt),
    read: backend.read,
  };
}

function countUnread(items: AppNotification[]): number {
  return items.filter((n) => !n.read).length;
}

let socketInstance: any = null;

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchNotifications: async (isRefresh = false) => {
    const { items } = get();
    const hasExistingData = items.length > 0;

    set({
      isLoading: !isRefresh && !hasExistingData,
      isRefreshing: isRefresh,
      error: null
    });

    try {
      const data = await notificationService.getNotifications();
      const mapped = data.map(toAppNotification);
      set({ items: mapped, unreadCount: countUnread(mapped) });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load notifications' });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  markRead: async (id) => {
    // Optimistic update
    const prevItems = get().items;
    const optimisticItems = prevItems.map((n) => (n.id === id ? { ...n, read: true } : n));
    set({ items: optimisticItems, unreadCount: countUnread(optimisticItems) });
    
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark read', error);
      // Revert on failure
      set({ items: prevItems, unreadCount: countUnread(prevItems) });
    }
  },

  markAllRead: async () => {
    const prevItems = get().items;
    const optimisticItems = prevItems.map((n) => ({ ...n, read: true }));
    set({ items: optimisticItems, unreadCount: 0 });

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all read', error);
      set({ items: prevItems, unreadCount: countUnread(prevItems) });
    }
  },

  subscribeToNotifications: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    if (socketInstance) return;

    socketInstance = getSocket();
    socketInstance.emit('join', user.id);

    socketInstance.on('newNotification', (backend: BackendNotification) => {
      const { items } = get();
      const appNotif = toAppNotification(backend);
      // Prepend the new notification
      const newItems = [appNotif, ...items];
      set({ items: newItems, unreadCount: countUnread(newItems) });
    });
  },

  unsubscribeFromNotifications: () => {
    if (socketInstance) {
      socketInstance.off('newNotification');
      socketInstance = null;
    }
  },
  
  reset: () => {
    set({
      items: [],
      unreadCount: 0,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });
  }
}));
