import apiClient from './apiClient';

export interface BackendChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: any;
  receiver?: any;
}

export interface BackendConversation {
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
  };
  lastMessage: BackendChatMessage;
}

export const chatService = {
  getConversations: async (): Promise<BackendConversation[]> => {
    const response = await apiClient.get('/chat');
    return response.data.data;
  },

  getMessages: async (username: string): Promise<BackendChatMessage[]> => {
    const response = await apiClient.get(`/chat/${username}`);
    return response.data.data;
  },

  sendMessage: async (receiverUsername: string, content: string): Promise<BackendChatMessage> => {
    const response = await apiClient.post('/chat', { receiverUsername, content });
    return response.data.data;
  },

  markMessagesAsRead: async (username: string): Promise<void> => {
    await apiClient.put(`/chat/${username}/read`);
  },
};
