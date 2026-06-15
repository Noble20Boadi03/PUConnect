import { apiClient } from './apiClient';
import type { ApiResponse } from '../types';
import type { DbServiceRequest } from '../types/core';

export type ServiceRequestTransitionAction =
  | 'cancel'
  | 'withdraw'
  | 'request_completion'
  | 'confirm_completion'
  | 'decline_completion';

export const serviceRequestService = {
  async getAll(): Promise<DbServiceRequest[]> {
    const response = await apiClient.get<ApiResponse<DbServiceRequest[]>>('/service-requests');
    return response.data.data;
  },

  async getForChat(postId: string, peerUsername: string): Promise<DbServiceRequest | null> {
    const response = await apiClient.get<ApiResponse<DbServiceRequest | null>>(
      '/service-requests/chat',
      { params: { postId, peerUsername } }
    );
    return response.data.data;
  },

  async getById(id: string): Promise<DbServiceRequest> {
    const response = await apiClient.get<ApiResponse<DbServiceRequest>>(`/service-requests/${id}`);
    return response.data.data;
  },

  async create(postId: string, message?: string): Promise<DbServiceRequest> {
    const response = await apiClient.post<ApiResponse<DbServiceRequest>>('/service-requests', {
      postId,
      message,
    });
    return response.data.data;
  },

  async transition(id: string, action: ServiceRequestTransitionAction): Promise<DbServiceRequest> {
    const response = await apiClient.patch<ApiResponse<DbServiceRequest>>(
      `/service-requests/${id}/transition`,
      { action }
    );
    return response.data.data;
  },

  async getEligibleForReview(): Promise<DbServiceRequest[]> {
    const response = await apiClient.get<ApiResponse<DbServiceRequest[]>>('/reviews/eligible/me');
    return response.data.data;
  },
};

export default serviceRequestService;
