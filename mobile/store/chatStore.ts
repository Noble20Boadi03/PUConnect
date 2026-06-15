import { create } from 'zustand';
import { chatService, BackendChatMessage, BackendConversation } from '../services/chatService';
import { useAuthStore } from './authStore';
import { getSocket } from '../lib/socket';
import { ChatMessage, ChatDateGroup, ChatParticipant, ChatThread } from '../types';

interface ChatState {
  conversations: BackendConversation[];
  activeThread: ChatThread | null;
  isLoading: boolean;
  
  fetchConversations: () => Promise<void>;
  fetchMessages: (username: string, participant: ChatParticipant, postContext?: any) => Promise<void>;
  sendMessage: (receiverUsername: string, content: string) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

const formatMessages = (messages: BackendChatMessage[], currentUserId: string): ChatDateGroup[] => {
  if (!messages.length) return [];
  
  const groups: Record<string, ChatMessage[]> = {};
  messages.forEach(msg => {
    const date = new Date(msg.createdAt);
    const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    
    const uiMsg: ChatMessage = {
      id: msg.id,
      kind: msg.senderId === currentUserId ? 'sent' : 'received',
      text: msg.content,
      time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };
    
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(uiMsg);
  });
  
  return Object.entries(groups).map(([dateLabel, messages]) => ({ dateLabel, messages }));
};

let socketInstance: any = null;

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeThread: null,
  isLoading: false,

  fetchConversations: async () => {
    try {
      const data = await chatService.getConversations();
      set({ conversations: data });
    } catch (error) {
      console.error('fetchConversations error:', error);
    }
  },

  fetchMessages: async (username, participant, postContext) => {
    set({ isLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const backendMessages = await chatService.getMessages(username);
      const dateGroups = formatMessages(backendMessages, user.id);

      set({
        activeThread: {
          providerUsername: username,
          participant,
          postContext,
          dateGroups,
        },
        isLoading: false,
      });
      
      chatService.markMessagesAsRead(username).catch(() => {});
    } catch (error) {
      console.error('fetchMessages error:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverUsername, content) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      const newMsg = await chatService.sendMessage(receiverUsername, content);
      
      const { activeThread } = get();
      if (activeThread && activeThread.providerUsername === receiverUsername) {
        const date = new Date(newMsg.createdAt);
        const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
        
        const uiMsg: ChatMessage = {
          id: newMsg.id,
          kind: 'sent',
          text: newMsg.content,
          time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        };
        
        const newGroups = [...activeThread.dateGroups].map(g => ({ ...g, messages: [...g.messages] }));
        const lastGroup = newGroups[newGroups.length - 1];
        if (lastGroup && lastGroup.dateLabel === dateLabel) {
           lastGroup.messages.push(uiMsg);
        } else {
           newGroups.push({ dateLabel, messages: [uiMsg] });
        }
        
        set({ activeThread: { ...activeThread, dateGroups: newGroups } });
      }
    } catch (error) {
      console.error('sendMessage error:', error);
    }
  },

  subscribeToMessages: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    if (socketInstance) return;
    
    socketInstance = getSocket();
    
    // Join the socket with user ID
    socketInstance.emit('join', user.id);
    
    // Listen for new messages
    socketInstance.on('newMessage', (newMsg: BackendChatMessage) => {
      const { activeThread, fetchConversations } = get();
      
      // Update active thread if the message is part of the current conversation
      if (activeThread) {
        const isRelevantMessage = 
          (newMsg.senderId === user.id && 
           (newMsg.receiver?.username === activeThread.providerUsername || 
            newMsg.sender?.username === activeThread.providerUsername)) ||
          (newMsg.receiverId === user.id && 
           (newMsg.sender?.username === activeThread.providerUsername || 
            newMsg.receiver?.username === activeThread.providerUsername));
        
        if (isRelevantMessage) {
          const date = new Date(newMsg.createdAt);
          const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
          
          const uiMsg: ChatMessage = {
            id: newMsg.id,
            kind: newMsg.senderId === user.id ? 'sent' : 'received',
            text: newMsg.content,
            time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          };
          
          const newGroups = [...activeThread.dateGroups].map(g => ({ ...g, messages: [...g.messages] }));
          const lastGroup = newGroups[newGroups.length - 1];
          if (lastGroup && lastGroup.dateLabel === dateLabel) {
             lastGroup.messages.push(uiMsg);
          } else {
             newGroups.push({ dateLabel, messages: [uiMsg] });
          }
          
          set({ activeThread: { ...activeThread, dateGroups: newGroups } });
          
          // Mark messages as read if we received them
          if (newMsg.receiverId === user.id) {
            chatService.markMessagesAsRead(activeThread.providerUsername).catch(() => {});
          }
        }
      }
      
      // Refresh conversations list
      fetchConversations();
    });
  },

  unsubscribeFromMessages: () => {
    if (socketInstance) {
      socketInstance.off('newMessage');
      socketInstance.disconnect();
      socketInstance = null;
    }
  }
}));
