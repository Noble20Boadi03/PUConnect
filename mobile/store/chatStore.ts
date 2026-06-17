import { create } from 'zustand';
import { chatService, BackendChatMessage, BackendConversation, GetMessagesResponse, GetConversationsResponse } from '../services/chatService';
import { useAuthStore } from './authStore';
import { getSocket } from '../lib/socket';
import { ChatMessage, ChatDateGroup, ChatParticipant, ChatThread, ChatPostContext } from '../types';
import { parsePostPrice } from '../lib/mapDbPost';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ChatState {
  conversations: BackendConversation[];
  activeThread: ChatThread | null;
  currentId: string | null;
  lastFetched: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMoreMessages: boolean;
  conversationsPage: number;
  hasMoreConversations: boolean;
  isLoadingMoreConversations: boolean;
  isLoadingMoreMessages: boolean;
  
  fetchConversations: (forceRefresh?: boolean) => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  fetchMessages: (username: string, participant: ChatParticipant, postContext?: ChatPostContext, forceRefresh?: boolean, cursor?: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (receiverUsername: string, content: string, postId?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  muteConversation: (username: string) => Promise<void>;
  unmuteConversation: (username: string) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  clearCache: () => void;
  removeMessage: (messageId: string) => void;
  clearPostContext: () => void;
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

// Helper to merge new date groups into existing ones
const mergeDateGroups = (existingGroups: ChatDateGroup[], newGroups: ChatDateGroup[]): ChatDateGroup[] => {
  const merged: ChatDateGroup[] = [...existingGroups];
  
  newGroups.forEach(newGroup => {
    const existingGroupIndex = merged.findIndex(g => g.dateLabel === newGroup.dateLabel);
    if (existingGroupIndex !== -1) {
      // Merge messages into existing group
      merged[existingGroupIndex] = {
        ...merged[existingGroupIndex],
        messages: [...newGroup.messages, ...merged[existingGroupIndex].messages]
      };
    } else {
      // Add new group at the beginning
      merged.unshift(newGroup);
    }
  });
  
  return merged;
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
  currentId: null,
  lastFetched: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  nextCursor: null,
  hasMoreMessages: false,
  conversationsPage: 1,
  hasMoreConversations: false,
  isLoadingMoreConversations: false,
  isLoadingMoreMessages: false,

  fetchConversations: async (forceRefresh = false) => {
    try {
      set({ isRefreshing: true });
      const response: GetConversationsResponse = await chatService.getConversations(1, 20);
      set({ 
        conversations: response.data, 
        error: null, 
        isRefreshing: false,
        conversationsPage: 1,
        hasMoreConversations: response.hasMore
      });
    } catch (error) {
      console.error('fetchConversations error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load conversations', isRefreshing: false });
    }
  },

  loadMoreConversations: async () => {
    const { conversationsPage, hasMoreConversations, isLoadingMoreConversations, conversations } = get();
    
    if (!hasMoreConversations || isLoadingMoreConversations) return;
    
    try {
      set({ isLoadingMoreConversations: true });
      const nextPage = conversationsPage + 1;
      const response: GetConversationsResponse = await chatService.getConversations(nextPage, 20);
      
      set({ 
        conversations: [...conversations, ...response.data], 
        conversationsPage: nextPage, 
        hasMoreConversations: response.hasMore, 
        isLoadingMoreConversations: false 
      });
    } catch (error) {
      console.error('loadMoreConversations error:', error);
      set({ isLoadingMoreConversations: false });
    }
  },

  fetchMessages: async (username, participant, postContext, forceRefresh = false, cursor?: string) => {
    const { currentId, lastFetched, activeThread } = get();
    const now = Date.now();

    // Check cache only for initial load without cursor
    if (!forceRefresh && !cursor && currentId === username && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }

    const hasExistingData = currentId === username && activeThread !== null;

    set({ 
      isLoading: !hasExistingData && !forceRefresh && !cursor, 
      isRefreshing: (forceRefresh || (hasExistingData && !forceRefresh)) && !cursor,
      isLoadingMoreMessages: !!cursor,
      error: null 
    });
    
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const response: GetMessagesResponse = await chatService.getMessages(username, cursor);
      const dateGroups = formatMessages(response.data, user.id);

      // If no post context provided, try to get the latest post from messages
      let finalPostContext = postContext;
      if (!finalPostContext && response.data.length > 0) {
        // Find the latest message with a post (look from the end)
        const latestPostMessage = [...response.data].reverse().find(msg => msg.post);
        if (latestPostMessage?.post) {
          finalPostContext = buildPostContext(latestPostMessage.post);
        }
      }

      if (cursor && activeThread) {
        // Merge with existing messages
        const mergedGroups = mergeDateGroups(activeThread.dateGroups, dateGroups);
        
        set({
          activeThread: {
            ...activeThread,
            dateGroups: mergedGroups,
          },
          nextCursor: response.nextCursor,
          hasMoreMessages: response.hasMore,
          isLoadingMoreMessages: false,
        });
      } else {
        set({
          activeThread: {
            providerUsername: username,
            participant,
            postContext: finalPostContext,
            dateGroups,
          },
          currentId: username,
          lastFetched: now,
          nextCursor: response.nextCursor,
          hasMoreMessages: response.hasMore,
          isLoading: false,
          isRefreshing: false,
          isLoadingMoreMessages: false,
        });
      }
      
      chatService.markMessagesAsRead(username).catch(() => {});
    } catch (error) {
      console.error('fetchMessages error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
        isRefreshing: false,
        isLoadingMoreMessages: false
      });
    }
  },

  loadMoreMessages: async () => {
    const { activeThread, nextCursor, hasMoreMessages, isLoadingMoreMessages, fetchMessages } = get();
    
    if (!activeThread || !hasMoreMessages || isLoadingMoreMessages || !nextCursor) return;
    
    await fetchMessages(activeThread.providerUsername, activeThread.participant, activeThread.postContext, false, nextCursor);
  },

  clearCache: () => {
    set({ lastFetched: null });
  },

  removeMessage: (messageId) => {
    const { activeThread } = get();
    if (!activeThread) return;
    
    const newGroups = activeThread.dateGroups.map(g => ({
      ...g,
      messages: g.messages.filter(m => m.id !== messageId)
    })).filter(g => g.messages.length > 0);
    
    set({ activeThread: { ...activeThread, dateGroups: newGroups } });
  },

  clearPostContext: () => {
    const { activeThread } = get();
    if (!activeThread) return;
    set({ activeThread: { ...activeThread, postContext: undefined } });
  },

  sendMessage: async (receiverUsername, content, postId) => {
    let uiMsgId: string | null = null;
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      const { activeThread } = get();
      if (!activeThread || activeThread.providerUsername !== receiverUsername) return;
      
      // Add optimistic update
      const date = new Date();
      const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
      
      uiMsgId = `pending-${Date.now()}`;
      const uiMsg: ChatMessage = {
        id: uiMsgId,
        kind: 'sent',
        text: content,
        time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        status: 'pending',
      };

      const newGroups = [...activeThread.dateGroups.map((g) => ({ ...g, messages: [...g.messages] }))];
      const lastGroup = newGroups[newGroups.length - 1];
      if (lastGroup && lastGroup.dateLabel === dateLabel) {
        lastGroup.messages.push(uiMsg);
      } else {
        newGroups.push({ dateLabel, messages: [uiMsg] });
      }

      // If we have a post and no current post context, set it now
      let newPostContext = activeThread.postContext;
      
      set({
        activeThread: {
          ...activeThread,
          dateGroups: newGroups,
          postContext: newPostContext,
        },
      });

      // Actual send
      const newMsg = await chatService.sendMessage(receiverUsername, content, postId);
      
      // Replace optimistic with real
      const { activeThread: updatedThread } = get();
      if (!updatedThread || updatedThread.providerUsername !== receiverUsername) return;
      
      const finalGroups = [...updatedThread.dateGroups.map((g) => ({
        ...g,
        messages: g.messages.map((m) => m.id === uiMsgId ? {
          id: newMsg.id,
          kind: 'sent' as const,
          text: newMsg.content,
          time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          status: 'sent' as const,
        } : m),
      }))];

      if (!newPostContext && newMsg.post) {
        newPostContext = buildPostContext(newMsg.post);
      }
      
      set({
        activeThread: { ...updatedThread,
          dateGroups: finalGroups,
          postContext: newPostContext,
        },
      });
    } catch (error) {
      console.error('sendMessage error:', error);
      const { activeThread } = get();
      if (!activeThread || activeThread.providerUsername !== receiverUsername || !uiMsgId) return;
      
      const failedGroups = [...activeThread.dateGroups.map((g) => ({
        ...g,
        messages: g.messages.map((m) => m.id === uiMsgId ? {
          ...m,
          status: 'failed' as const,
        } : m),
      }))];
      
      set({
        activeThread: {
          ...activeThread,
          dateGroups: failedGroups,
        },
      });
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      // Optimistically remove from UI first
      const { activeThread, removeMessage } = get();
      if (activeThread) {
        removeMessage(messageId);
      }

      // Call API to delete
      await chatService.deleteMessage(messageId);
    } catch (error) {
      console.error('DeleteMessage error:', error);
    }
  },

  muteConversation: async (username: string) => {
    try {
      await chatService.muteConversation(username);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.user.username === username ? { ...conv, isMuted: true } : conv
        )
      }));
    } catch (error) {
      console.error('MuteConversation error:', error);
    }
  },

  unmuteConversation: async (username: string) => {
    try {
      await chatService.unmuteConversation(username);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.user.username === username ? { ...conv, isMuted: false } : conv
        )
      }));
    } catch (error) {
      console.error('UnmuteConversation error:', error);
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
          // First check if we have a pending message that this should replace
          const hasPendingMessage = activeThread.dateGroups.some(
            group => group.messages.some(msg => msg.status === 'pending')
          );
          
          // Check if message already exists with real ID
          const messageExists = activeThread.dateGroups.some(
            group => group.messages.some(msg => msg.id === newMsg.id)
          );
          
          if (messageExists) {
            if (newMsg.receiverId === user.id) {
              chatService.markMessagesAsRead(activeThread.providerUsername).catch(() => {});
            }
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
          
          // If we have a pending message and this is from us, replace the pending one
          if (hasPendingMessage && newMsg.senderId === user.id) {
            let replaced = false;
            const newGroups = [...activeThread.dateGroups.map(g => ({
              ...g,
              messages: g.messages.map(m => {
                if (m.status === 'pending' && !replaced) {
                  replaced = true;
                  return uiMsg;
                }
                return m;
              })
            }))];
            
            // If we have a post and no current post context, set it now
            let newPostContext = activeThread.postContext;
            if (!newPostContext && newMsg.post) {
              newPostContext = buildPostContext(newMsg.post);
            }
            
            set({ activeThread: { ...activeThread, dateGroups: newGroups, postContext: newPostContext } });
            
            if (newMsg.receiverId === user.id) {
              chatService.markMessagesAsRead(activeThread.providerUsername).catch(() => {});
            }
            fetchConversations();
            return;
          }

          // Otherwise add as new message
          const newGroups = [...activeThread.dateGroups.map(g => ({ ...g, messages: [...g.messages] }))];
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

    // Listen for message deleted events
    socketInstance.on('messageDeleted', (data: { messageId: string, threadId: string }) => {
      const { activeThread, removeMessage } = get();
      if (activeThread) {
        removeMessage(data.messageId);
      }
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
