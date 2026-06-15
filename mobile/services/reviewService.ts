import { apiClient } from './apiClient';
import type { ApiResponse } from '../types';

export interface DbReview {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  serviceTitle: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  reviewee: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
}

export const reviewService = {
  async getReviewsForUser(username: string): Promise<DbReview[]> {
    const response = await apiClient.get<ApiResponse<DbReview[]>>(`/reviews/${username}`);
    return response.data.data;
  },

  async createReview(data: {
    revieweeUsername: string;
    rating: number;
    comment: string;
    serviceTitle?: string;
    serviceRequestId?: string;
    postId?: string;
  }): Promise<DbReview> {
    const response = await apiClient.post<ApiResponse<DbReview>>('/reviews', data);
    return response.data.data;
  },
};

export default reviewService;
