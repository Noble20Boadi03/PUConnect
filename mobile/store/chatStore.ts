import { create } from 'zustand';
import { chatService, BackendChatMessage, BackendConversation, GetMessagesResponse, GetConversationsResponse } from '../services/chatService';
import { useAuthStore } from './authStore';
import { useServiceRequestsStore } from './serviceRequestsStore';
import { profileService } from '../services/profileService';
import { postService } from '../services/postService';
import { getSocket } from '../lib/socket';
import { ChatMessage, ChatDateGroup, ChatParticipant, ChatThread, ChatPostContext } from '../types';
import { parsePostPrice } from '../lib/mapDbPost';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface ChatState {
  conversations: BackendConversation[];
  threads: Record<string, {
    thread: ChatThread;
    participantProfile: any;
    lastFetched: number;
  }>;
  activeUsername: string | null;
  accessOrder: string[];
  activeThread: ChatThread | null;
  currentId: string | null;
  lastFetched: number | null;
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMoreMessages: boolean;
  conversationsPage: number;
  hasMoreConversations: boolean;
  isLoadingMoreConversations: boolean;
  isLoadingMoreMessages: boolean;
  
  fetchConversations: (forceRefresh?: boolean, isManualPull?: boolean) => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  openChat: (username: string, postId?: string) => Promise<void>;
  fetchMessages: (username: string, participant: ChatParticipant, postContext?: ChatPostContext, forceRefresh?: boolean, cursor?: string, isManualPull?: boolean) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (receiverUsername: string, content: string, postId?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteConversation: (username: string) => Promise<void>;
  muteConversation: (username: string) => Promise<void>;
  unmuteConversation: (username: string) => Promise<void>;
  pinConversation: (username: string) => Promise<void>;
  unpinConversation: (username: string) => Promise<void>;
  markMessagesAsRead: (username: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  clearCache: () => void;
  removeMessage: (messageId: string) => void;
  clearPostContext: () => void;
  reset: () => void;
}

const formatMessages = (messages: BackendChatMessage[], currentUserId: string): ChatDateGroup[] => {
  if (!messages.length) return [];
  
  const groups: Record<string, ChatMessage[]> = {};
  messages.forEach(msg => {
    const date = new Date(msg.createdAt);
    const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    
    const uiMsg: ChatMessage = {
      id: msg.id,
      kind: msg.kind === 'system' ? 'system' : msg.senderId === currentUserId ? 'sent' : 'received',
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
    priceLabel = `₵${price.amount}`;
  } else if (price.kind === 'range') {
    priceLabel = `₵${price.min}-₵${price.max}`;
  }
  
  return {
    postId: post.id,
    title: post.title,
    tag: post.tag as 'Service' | 'Request',
    priceLabel,
    authorId: post.authorId
  };
};

let socketInstance: any = null;

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  threads: {},
  activeUsername: null,
  accessOrder: [],
  activeThread: null,
  currentId: null,
  lastFetched: null,
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
  nextCursor: null,
  hasMoreMessages: false,
  conversationsPage: 1,
  hasMoreConversations: false,
  isLoadingMoreConversations: false,
  isLoadingMoreMessages: false,

  fetchConversations: async (forceRefresh = false, isManualPull = false) => {
    const { lastFetched } = get();
    const now = Date.now();
    if (!forceRefresh && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }
    try {
      set({ isRefreshing: isManualPull });
      const response: GetConversationsResponse = await chatService.getConversations(1, 20);
      set({ 
        conversations: response.data, 
        error: null, 
        isRefreshing: false,
        conversationsPage: 1,
        hasMoreConversations: response.hasMore,
        lastFetched: now
      });
    } catch (error) {
      console.error('fetchConversations error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load conversations', isRefreshing: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { count } = await chatService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('fetchUnreadCount error:', error);
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

  openChat: async (username, postId) => {
    const { threads, fetchMessages, accessOrder } = get();
    const now = Date.now();

    // 1. Synchronously set activeUsername and update LRU access order
    const newOrder = [username, ...accessOrder.filter(u => u !== username)].slice(0, 10);
    const cached = threads[username];
    
    set({ 
      activeUsername: username,
      accessOrder: newOrder,
      activeThread: cached?.thread ?? null,
      currentId: username,
      isLoading: !cached,
      error: null
    });

    const refresh = async () => {
      try {
        // First fetch participant profile (always required)
        const participantProfile = await profileService.getPublicProfile(username);
        
        // Fetch service requests (using the store directly)
        await useServiceRequestsStore.getState().fetchRequests();
        
        // Fetch post context if needed
        let post;
        try {
          post = postId ? await postService.getPostById(postId) : undefined;
        } catch (postError) {
          console.warn('Failed to fetch post context for chat:', postError);
          post = undefined;
        }

        let postContext: ChatPostContext | undefined = undefined;
        if (post) {
          const price = parsePostPrice(post.price);
          let priceLabel = '';
          if (price.kind === 'fixed') {
            priceLabel = `₵${price.amount}`;
          } else if (price.kind === 'range') {
            priceLabel = `₵${price.min}-₵${price.max}`;
          }

          postContext = {
            postId: post.id,
            title: post.title,
            tag: post.tag as 'Service' | 'Request',
            priceLabel,
            authorId: post.authorId,
          };
        }

        // Fetch messages and update the specific thread in cache
        await fetchMessages(
          username,
          {
            displayName: participantProfile.name || username,
            handle: `@${participantProfile.username || username}`,
            avatarUrl: participantProfile.avatarUrl || '',
          },
          postContext,
          true // Force refresh to update cache
        );

        // Update the profile and lastFetched timestamp in our threads cache
        set(state => {
          if (!state.threads[username]) return state; // Should be populated by fetchMessages now
          return {
            threads: {
              ...state.threads,
              [username]: {
                ...state.threads[username],
                participantProfile,
                lastFetched: Date.now()
              }
            }
          };
        });

        // Refresh conversations and unread count
        get().fetchConversations(true);
        get().fetchUnreadCount();
      } catch (error) {
        console.error('openChat refresh error:', error);
        if (!cached) {
          set({ error: error instanceof Error ? error.message : 'Failed to load chat', isLoading: false });
        }
      }
    };

    if (cached && (now - cached.lastFetched < CACHE_TTL)) {
      // Very fresh, no need even for background refresh
      return;
    }

    if (cached) {
      // Stale-while-revalidate: refresh in background
      refresh();
    } else {
      // Block for initial load
      await refresh();
    }
  },

  fetchMessages: async (username, participant, postContext, forceRefresh = false, cursor?: string, isManualPull = false) => {
    const { threads, activeUsername } = get();
    const cached = threads[username];
    const now = Date.now();

    // Check cache only for initial load without cursor
    if (!forceRefresh && !cursor && cached && now - cached.lastFetched < CACHE_TTL) {
      return;
    }

    const hasExistingData = !!cached;

    set({ 
      isLoading: !hasExistingData && !cursor, 
      isRefreshing: isManualPull && !cursor,
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

      set(state => {
        let newThread: ChatThread;
        const existingThread = state.threads[username]?.thread;

        if (cursor && existingThread) {
          // Merge with existing messages
          const mergedGroups = mergeDateGroups(existingThread.dateGroups, dateGroups);
          newThread = {
            ...existingThread,
            dateGroups: mergedGroups,
          };
        } else {
          newThread = {
            providerUsername: username,
            participant,
            postContext: finalPostContext,
            dateGroups,
          };
        }

        const updatedThreads = {
          ...state.threads,
          [username]: {
            thread: newThread,
            participantProfile: state.threads[username]?.participantProfile || {},
            lastFetched: now,
          }
        };

        // LRU Eviction: only keep 10 most recent
        const newAccessOrder = [username, ...state.accessOrder.filter(u => u !== username)].slice(0, 10);
        const prunedThreads: Record<string, any> = {};
        newAccessOrder.forEach(u => {
          if (updatedThreads[u]) prunedThreads[u] = updatedThreads[u];
        });

        return {
          threads: prunedThreads,
          accessOrder: newAccessOrder,
          activeThread: state.activeUsername === username ? newThread : state.activeThread,
          currentId: state.activeUsername === username ? username : state.currentId,
          lastFetched: state.activeUsername === username ? now : state.lastFetched,
          nextCursor: state.activeUsername === username ? response.nextCursor : state.nextCursor,
          hasMoreMessages: state.activeUsername === username ? response.hasMore : state.hasMoreMessages,
          isLoading: false,
          isRefreshing: false,
          isLoadingMoreMessages: false,
        };
      });
      
      chatService.markMessagesAsRead(username).then(() => {
        get().fetchUnreadCount();
      }).catch(() => {});
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
    set({ threads: {}, accessOrder: [], activeThread: null, currentId: null, lastFetched: null });
  },

  removeMessage: (messageId) => {
    set(state => {
      const updatedThreads = { ...state.threads };
      let updatedActiveThread = state.activeThread;

      Object.keys(updatedThreads).forEach(username => {
        const thread = updatedThreads[username].thread;
        const newGroups = thread.dateGroups.map(g => ({
          ...g,
          messages: g.messages.filter(m => m.id !== messageId)
        })).filter(g => g.messages.length > 0);
        
        updatedThreads[username] = {
          ...updatedThreads[username],
          thread: { ...thread, dateGroups: newGroups }
        };

        if (state.activeUsername === username) {
          updatedActiveThread = updatedThreads[username].thread;
        }
      });

      return { threads: updatedThreads, activeThread: updatedActiveThread };
    });
  },

  clearPostContext: () => {
    set(state => {
      if (!state.activeUsername || !state.threads[state.activeUsername]) return state;
      
      const username = state.activeUsername;
      const updatedThread = { ...state.threads[username].thread, postContext: undefined };
      
      return {
        threads: {
          ...state.threads,
          [username]: { ...state.threads[username], thread: updatedThread }
        },
        activeThread: updatedThread
      };
    });
  },

  sendMessage: async (receiverUsername, content, postId) => {
    let uiMsgId: string | null = null;
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      const { threads } = get();
      const threadEntry = threads[receiverUsername];
      if (!threadEntry) return;
      const activeThread = threadEntry.thread;
      
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

      const optimisticThread = {
        ...activeThread,
        dateGroups: newGroups,
      };

      set(state => ({
        threads: {
          ...state.threads,
          [receiverUsername]: { ...state.threads[receiverUsername], thread: optimisticThread }
        },
        activeThread: state.activeUsername === receiverUsername ? optimisticThread : state.activeThread
      }));

      // Actual send
      const newMsg = await chatService.sendMessage(receiverUsername, content, postId);
      
      // Replace optimistic with real
      set(state => {
        const currentEntry = state.threads[receiverUsername];
        if (!currentEntry) return state;
        const currentThread = currentEntry.thread;

        const finalGroups = [...currentThread.dateGroups.map((g) => ({
          ...g,
          messages: g.messages.map((m) => m.id === uiMsgId ? {
            id: newMsg.id,
            kind: 'sent' as const,
            text: newMsg.content,
            time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            status: 'sent' as const,
          } : m),
        }))];

        let newPostContext = currentThread.postContext;
        if (!newPostContext && newMsg.post) {
          newPostContext = buildPostContext(newMsg.post);
        }
        
        const updatedThread = {
          ...currentThread,
          dateGroups: finalGroups,
          postContext: newPostContext,
        };

        return {
          threads: {
            ...state.threads,
            [receiverUsername]: { ...state.threads[receiverUsername], thread: updatedThread }
          },
          activeThread: state.activeUsername === receiverUsername ? updatedThread : state.activeThread
        };
      });

      // Refresh conversations and unread count after sending new message
      get().fetchConversations(true);
      get().fetchUnreadCount();
    } catch (error) {
      console.error('sendMessage error:', error);
      set(state => {
        const currentEntry = state.threads[receiverUsername];
        if (!currentEntry || !uiMsgId) return state;
        const currentThread = currentEntry.thread;

        const failedGroups = [...currentThread.dateGroups.map((g) => ({
          ...g,
          messages: g.messages.map((m) => m.id === uiMsgId ? {
            ...m,
            status: 'failed' as const,
          } : m),
        }))];
        
        const updatedThread = { ...currentThread, dateGroups: failedGroups };

        return {
          threads: {
            ...state.threads,
            [receiverUsername]: { ...state.threads[receiverUsername], thread: updatedThread }
          },
          activeThread: state.activeUsername === receiverUsername ? updatedThread : state.activeThread
        };
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

  deleteConversation: async (username: string) => {
    try {
      await chatService.deleteConversation(username);
      set((state) => {
        const newThreads = { ...state.threads };
        delete newThreads[username];
        const newOrder = state.accessOrder.filter(u => u !== username);
        
        return {
          conversations: state.conversations.filter((conv) => conv.user.username !== username),
          threads: newThreads,
          accessOrder: newOrder,
          activeThread: state.activeUsername === username ? null : state.activeThread,
          activeUsername: state.activeUsername === username ? null : state.activeUsername
        };
      });
    } catch (error) {
      console.error('DeleteConversation error:', error);
      throw error;
    }
  },

  pinConversation: async (username: string) => {
    try {
      await chatService.pinConversation(username);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.user.username === username ? { ...conv, isPinned: true } : conv
        )
      }));
    } catch (error) {
      console.error('PinConversation error:', error);
    }
  },

  unpinConversation: async (username: string) => {
    try {
      await chatService.unpinConversation(username);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.user.username === username ? { ...conv, isPinned: false } : conv
        )
      }));
    } catch (error) {
      console.error('UnpinConversation error:', error);
    }
  },

  markMessagesAsRead: async (username: string) => {
    try {
      await chatService.markMessagesAsRead(username);
      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.user.username !== username) return conv;
          return {
            ...conv,
            lastMessage: { ...conv.lastMessage, isRead: true }
          };
        })
      }));
    } catch (error) {
      console.error('MarkMessagesAsRead error:', error);
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
      const { threads, activeUsername, fetchConversations, fetchUnreadCount } = get();
      
      // Find which conversation this message belongs to
      let targetUsername: string | null = null;
      if (newMsg.senderId === user.id) {
        targetUsername = newMsg.receiver?.username || null;
      } else if (newMsg.receiverId === user.id) {
        targetUsername = newMsg.sender?.username || null;
      }

      if (targetUsername && threads[targetUsername]) {
        const threadEntry = threads[targetUsername];
        const thread = threadEntry.thread;
        
        // Check if message already exists
        const messageExists = thread.dateGroups.some(
          group => group.messages.some(msg => msg.id === newMsg.id)
        );
        
        if (!messageExists) {
          const date = new Date(newMsg.createdAt);
          const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
          
          const uiMsg: ChatMessage = {
            id: newMsg.id,
            kind: newMsg.kind === 'system' ? 'system' : newMsg.senderId === user.id ? 'sent' : 'received',
            text: newMsg.content,
            time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          };

          // Update thread date groups
          const newGroups = [...thread.dateGroups.map(g => ({ ...g, messages: [...g.messages] }))];
          
          // If we have a pending message from us, replace it
          let replaced = false;
          if (newMsg.senderId === user.id) {
            newGroups.forEach(g => {
              g.messages = g.messages.map(m => {
                if (m.status === 'pending' && !replaced) {
                  replaced = true;
                  return uiMsg;
                }
                return m;
              });
            });
          }

          if (!replaced) {
            const lastGroup = newGroups[newGroups.length - 1];
            if (lastGroup && lastGroup.dateLabel === dateLabel) {
              lastGroup.messages.push(uiMsg);
            } else {
              newGroups.push({ dateLabel, messages: [uiMsg] });
            }
          }

          let newPostContext = thread.postContext;
          if (!newPostContext && newMsg.post) {
            newPostContext = buildPostContext(newMsg.post);
          }

          const updatedThread = { ...thread, dateGroups: newGroups, postContext: newPostContext };

          set(state => ({
            threads: {
              ...state.threads,
              [targetUsername!]: { ...state.threads[targetUsername!], thread: updatedThread }
            },
            activeThread: state.activeUsername === targetUsername ? updatedThread : state.activeThread
          }));
        }

        // Mark as read if we are currently looking at this chat
        if (newMsg.receiverId === user.id && activeUsername === targetUsername) {
          chatService.markMessagesAsRead(targetUsername).then(() => {
            fetchConversations();
            fetchUnreadCount();
          }).catch(() => {});
        } else {
          fetchConversations();
          fetchUnreadCount();
        }
      } else {
        // Refresh conversations list for irrelevant messages or if no cached thread
        fetchConversations();
        fetchUnreadCount();
      }
    });

    // Listen for message deleted events
    socketInstance.on('messageDeleted', (data: { messageId: string, threadId: string }) => {
      get().removeMessage(data.messageId);
    });
  },

  unsubscribeFromMessages: () => {
    if (socketInstance) {
      socketInstance.off('newMessage');
      socketInstance.off('messageDeleted');
      socketInstance.disconnect();
      socketInstance = null;
    }
  },
  
  reset: () => {
    set({
      conversations: [],
      threads: {},
      activeUsername: null,
      accessOrder: [],
      activeThread: null,
      currentId: null,
      lastFetched: null,
      unreadCount: 0,
      isLoading: false,
      isRefreshing: false,
      error: null,
      nextCursor: null,
      hasMoreMessages: false,
      conversationsPage: 1,
      hasMoreConversations: false,
      isLoadingMoreConversations: false,
      isLoadingMoreMessages: false,
    });
  }
}));
