import { create } from 'zustand';
import { serviceRequestService } from '../services/serviceRequestService';
import { isActiveServiceStatus } from '../lib/mapServiceRequest';
import type { DbServiceRequest } from '../types/core';
import type { CompletedDeal } from '../types/review';
import { getSocket } from '../lib/socket';
import { useAuthStore } from './authStore';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ServiceRequestsState {
  requests: DbServiceRequest[];
  activeCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hydrated: boolean;
  lastFetched: number | null;
  fetchRequests: (isRefresh?: boolean) => Promise<void>;
  fetchActiveCount: () => Promise<void>;
  fetchForChat: (postId: string, peerUsername: string) => Promise<DbServiceRequest | null>;
  fetchStatusForPost: (postId: string) => Promise<DbServiceRequest | null>;
  createOfficialEngagement: (postId: string) => Promise<DbServiceRequest>;
  transition: (
    id: string,
    action: Parameters<typeof serviceRequestService.transition>[1]
  ) => Promise<DbServiceRequest>;
  accept: (id: string) => Promise<DbServiceRequest>;
  decline: (id: string) => Promise<DbServiceRequest>;
  upsertRequest: (request: DbServiceRequest) => void;
  subscribeToUpdates: () => () => void;
  getActiveCount: () => number;
  getCompletedDealsForReviews: () => CompletedDeal[];
  getPastServicesWithUser: (peerId: string) => DbServiceRequest[];
  reset: () => void;
}

function upsertById(list: DbServiceRequest[], item: DbServiceRequest): DbServiceRequest[] {
  const index = list.findIndex((r) => r.id === item.id);
  if (index === -1) return [item, ...list];
  const next = [...list];
  next[index] = item;
  return next;
}

export const useServiceRequestsStore = create<ServiceRequestsState>((set, get) => ({
  requests: [],
  activeCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
  hydrated: false,
  lastFetched: null,

  fetchActiveCount: async () => {
    try {
      const { count } = await serviceRequestService.getActiveCount();
      set({ activeCount: count });
    } catch (error) {
      console.error('Failed to fetch active service request count:', error);
    }
  },

  fetchRequests: async (isRefresh = false) => {
    const { requests, lastFetched } = get();
    const now = Date.now();
    const hasExistingData = requests.length > 0;

    if (!isRefresh && lastFetched && now - lastFetched < CACHE_TTL) {
      return;
    }

    set({
      isLoading: !isRefresh && !hasExistingData,
      isRefreshing: isRefresh,
      error: null
    });

    try {
      const requests = await serviceRequestService.getAll();
      set({ requests, hydrated: true, lastFetched: now });
      
      // Sync completed deals to provider reviews store
      const deals = get().getCompletedDealsForReviews();
      void import('./providerReviewsStore').then(({ useProviderReviewsStore }) => {
        useProviderReviewsStore.getState().syncCompletedDealsFromRequests(deals);
      });
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load requests' });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  fetchForChat: async (postId, peerUsername) => {
    try {
      const request = await serviceRequestService.getForChat(postId, peerUsername);
      if (request) {
        set((state) => ({ requests: upsertById(state.requests, request) }));
      }
      return request;
    } catch (error) {
      console.error('Failed to fetch chat service request:', error);
      return null;
    }
  },

  fetchStatusForPost: async (postId) => {
    try {
      const request = await serviceRequestService.getStatusForPost(postId);
      if (request) {
        set((state) => ({ requests: upsertById(state.requests, request) }));
      }
      return request;
    } catch (error) {
      console.error('Failed to fetch post service status:', error);
      return null;
    }
  },

  createOfficialEngagement: async (postId) => {
    const request = await serviceRequestService.create(postId);
    set((state) => ({ requests: upsertById(state.requests, request) }));
    return request;
  },

  transition: async (id, action) => {
    const request = await serviceRequestService.transition(id, action);
    set((state) => ({ requests: upsertById(state.requests, request) }));
    return request;
  },

  accept: async (id) => {
    const request = await serviceRequestService.accept(id);
    set((state) => ({ requests: upsertById(state.requests, request) }));
    return request;
  },

  decline: async (id) => {
    const request = await serviceRequestService.decline(id);
    set((state) => ({ requests: upsertById(state.requests, request) }));
    return request;
  },

  upsertRequest: (request) => {
    set((state) => ({ requests: upsertById(state.requests, request) }));
    if (request.status === 'completed') {
      void import('./providerReviewsStore').then(({ useProviderReviewsStore }) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId || request.requesterId !== userId) return;
        useProviderReviewsStore.getState().syncCompletedDealsFromRequests([
          {
            id: request.id,
            serviceRequestId: request.id,
            revieweeUsername: request.provider?.username ?? '',
            postId: request.postId ?? '',
            postTitle: request.post?.title ?? 'Service',
            completedAt: request.completedAt
              ? new Date(request.completedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '',
          },
        ]);
      });
    }
  },

  subscribeToUpdates: () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return () => {};

    const socket = getSocket();
    socket.emit('join', userId);

    const handler = (request: DbServiceRequest) => {
      get().upsertRequest(request);
      get().fetchActiveCount();
    };

    socket.on('serviceRequestUpdated', handler);
    return () => {
      socket.off('serviceRequestUpdated', handler);
    };
  },

  getActiveCount: () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return 0;
    return get().requests.filter(
      (r) =>
        isActiveServiceStatus(r.status) &&
        (r.requesterId === userId || r.providerId === userId)
    ).length;
  },

  getCompletedDealsForReviews: () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return [];
    return get()
      .requests.filter((r) => r.requesterId === userId && r.status === 'completed')
      .map((r) => ({
        id: r.id,
        revieweeUsername: r.provider?.username ?? '',
        postId: r.postId ?? '',
        postTitle: r.post?.title ?? 'Service',
        completedAt: r.completedAt
          ? new Date(r.completedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '',
        serviceRequestId: r.id,
      }))
      .filter((d) => d.revieweeUsername && d.postId);
  },
  
  getPastServicesWithUser: (peerId: string) => {
    return get()
      .requests.filter((r) => 
        (r.requesterId === peerId || r.providerId === peerId) &&
        ['completed', 'cancelled', 'declined'].includes(r.status)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  reset: () => {
    set({
      requests: [],
      activeCount: 0,
      isLoading: false,
      isRefreshing: false,
      error: null,
      hydrated: false,
      lastFetched: null,
    });
  },
});
  },
}));

export default useServiceRequestsStore;
