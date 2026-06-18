import apiClient from './apiClient';

export interface BackendChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  postId?: string;
  kind: 'text' | 'system';
  isRead: boolean;
  createdAt: string;
  sender?: any;
  receiver?: any;
  post?: any;
}

export interface BackendConversation {
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
    role?: string;
  };
  lastMessage: BackendChatMessage;
  isMuted?: boolean;
  isPinned?: boolean;
}

export interface GetConversationsResponse {
  data: BackendConversation[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface GetMessagesResponse {
  data: BackendChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const chatService = {
  getConversations: async (page: number = 1, limit: number = 20): Promise<GetConversationsResponse> => {
    const response = await apiClient.get('/chat', {
      params: { page, limit }
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/chat/unread-count');
    return response.data.data;
  },

  getMessages: async (username: string, cursor?: string, limit: number = 30): Promise<GetMessagesResponse> => {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    const response = await apiClient.get(`/chat/${username}`, { params });
    return response.data;
  },

  sendMessage: async (receiverUsername: string, content: string, postId?: string): Promise<BackendChatMessage> => {
    const response = await apiClient.post('/chat', { receiverUsername, content, postId });
    return response.data.data;
  },

  markMessagesAsRead: async (username: string): Promise<void> => {
    await apiClient.put(`/chat/${username}/read`);
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/chat/message/${messageId}`);
  },

  deleteConversation: async (username: string): Promise<void> => {
    await apiClient.delete(`/chat/conversation/${username}`);
  },

  muteConversation: async (username: string): Promise<void> => {
    await apiClient.post(`/chat/${username}/mute`);
  },

  unmuteConversation: async (username: string): Promise<void> => {
    await apiClient.delete(`/chat/${username}/mute`);
  },

  pinConversation: async (username: string): Promise<void> => {
    await apiClient.post(`/chat/${username}/pin`);
  },

  unpinConversation: async (username: string): Promise<void> => {
    await apiClient.delete(`/chat/${username}/pin`);
  },
};
