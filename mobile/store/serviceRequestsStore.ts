import { create } from 'zustand';
import { serviceRequestService } from '../services/serviceRequestService';
import { isActiveServiceStatus } from '../lib/mapServiceRequest';
import type { DbServiceRequest } from '../types/core';
import type { CompletedDeal } from '../types/review';
import { getSocket } from '../lib/socket';
import { useAuthStore } from './authStore';

interface ServiceRequestsState {
  requests: DbServiceRequest[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hydrated: boolean;
  fetchRequests: (isRefresh?: boolean) => Promise<void>;
  fetchForChat: (postId: string, peerUsername: string) => Promise<DbServiceRequest | null>;
  createOfficialEngagement: (postId: string) => Promise<DbServiceRequest>;
  transition: (
    id: string,
    action: Parameters<typeof serviceRequestService.transition>[1]
  ) => Promise<DbServiceRequest>;
  upsertRequest: (request: DbServiceRequest) => void;
  subscribeToUpdates: () => () => void;
  getActiveCount: () => number;
  getCompletedDealsForReviews: () => CompletedDeal[];
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
  isLoading: false,
  isRefreshing: false,
  error: null,
  hydrated: false,

  fetchRequests: async (isRefresh = false) => {
    const { requests } = get();
    const hasExistingData = requests.length > 0;

    set({
      isLoading: !isRefresh && !hasExistingData,
      isRefreshing: isRefresh,
      error: null
    });

    try {
      const requests = await serviceRequestService.getAll();
      set({ requests, hydrated: true });
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
}));

export default useServiceRequestsStore;
