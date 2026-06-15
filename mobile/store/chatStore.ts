import { create } from 'zustand';
import { chatService, BackendChatMessage, BackendConversation } from '../services/chatService';
import { useAuthStore } from './authStore';
import { getSocket } from '../lib/socket';
import { ChatMessage, ChatDateGroup, ChatParticipant, ChatThread, ChatPostContext } from '../types';
import { parsePostPrice } from '../lib/mapDbPost';

interface ChatState {
  conversations: BackendConversation[];
  activeThread: ChatThread | null;
  isLoading: boolean;
  
  fetchConversations: () => Promise<void>;
  fetchMessages: (username: string, participant: ChatParticipant, postContext?: ChatPostContext) => Promise<void>;
  sendMessage: (receiverUsername: string, content: string, postId?: string) => Promise<void>;
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

// Helper to extract post context from a post
const buildPostContext = (post: any): ChatPostContext => {
  const price = parsePostPrice(post.price);
  let priceLabel = '';
  if (price.kind === 'fixed') {
    priceLabel = `$${price.amount}`;
  } else if (price.kind === 'range') {
    priceLabel = `$${price.min}-$${price.max}`;
  }
  
  return {
    postId: post.id,
    title: post.title,
    tag: post.tag as 'Service' | 'Request',
    priceLabel
  };
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

      // If no post context provided, try to get the latest post from messages
      let finalPostContext = postContext;
      if (!finalPostContext) {
        const latestPostMessage = backendMessages.find(msg => msg.post);
        if (latestPostMessage?.post) {
          finalPostContext = buildPostContext(latestPostMessage.post);
        }
      }

      set({
        activeThread: {
          providerUsername: username,
          participant,
          postContext: finalPostContext,
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

  sendMessage: async (receiverUsername, content, postId) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      const newMsg = await chatService.sendMessage(receiverUsername, content, postId);
      
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
        
        // Check if message already exists
        const messageExists = activeThread.dateGroups.some(
          group => group.messages.some(msg => msg.id === newMsg.id)
        );
        if (messageExists) return;
        
        const newGroups = [...activeThread.dateGroups].map(g => ({ ...g, messages: [...g.messages] }));
        const lastGroup = newGroups[newGroups.length - 1];
        if (lastGroup && lastGroup.dateLabel === dateLabel) {
           lastGroup.messages.push(uiMsg);
        } else {
           newGroups.push({ dateLabel, messages: [uiMsg] });
        }

        // If we have a post and no current post context, set it now
        let newPostContext = activeThread.postContext;
        if (!newPostContext && newMsg.post) {
          newPostContext = buildPostContext(newMsg.post);
        }
        
        set({ activeThread: { ...activeThread, dateGroups: newGroups, postContext: newPostContext } });
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
          // Check if message already exists
          const messageExists = activeThread.dateGroups.some(
            group => group.messages.some(msg => msg.id === newMsg.id)
          );
          if (messageExists) {
            // Still mark as read if we received it
            if (newMsg.receiverId === user.id) {
              chatService.markMessagesAsRead(activeThread.providerUsername).catch(() => {});
            }
            // Refresh conversations list
            fetchConversations();
            return;
          }

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

          // If we have a post and no current post context, set it now
          let newPostContext = activeThread.postContext;
          if (!newPostContext && newMsg.post) {
            newPostContext = buildPostContext(newMsg.post);
          }
          
          set({ activeThread: { ...activeThread, dateGroups: newGroups, postContext: newPostContext } });
          
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
