import apiClient from './apiClient';

export interface BackendNotification {
  id: string;
  userId: string;
  kind: 'message' | 'service' | 'request' | 'system';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<BackendNotification[]> => {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<BackendNotification> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },
};
