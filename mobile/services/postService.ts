import { apiClient } from './apiClient';
import type { ApiResponse, DbPost } from '../types';

export interface GetPostsParams {
  type?: 'service' | 'request';
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetPostsResponse {
  posts: DbPost[];
  totalCount: number;
  hasMore: boolean;
  nextPage: number | null;
}

/**
 * Post-related API actions (market feed, detail, create, update, delete).
 */
export const postService = {
  /**
   * Fetches all market posts with pagination and filters.
   * @route GET /api/posts
   */
  async getPosts(params?: GetPostsParams): Promise<GetPostsResponse> {
    const response = await apiClient.get<ApiResponse<GetPostsResponse>>('/posts', { params });
    return response.data.data;
  },

  /**
   * Fetches a single post by ID.
   * @route GET /api/posts/:id
   */
  async getPostById(id: string): Promise<DbPost> {
    const response = await apiClient.get<ApiResponse<DbPost>>(`/posts/${id}`);
    return response.data.data;
  },

  /**
   * Creates a new post for the authenticated user.
   * @route POST /api/posts
   */
  async createPost(data: CreatePostData): Promise<DbPost> {
    const response = await apiClient.post<ApiResponse<DbPost>>('/posts', data);
    return response.data.data;
  },

  /**
   * Updates an existing post owned by the authenticated user.
   * @route PUT /api/posts/:id
   */
  async updatePost(id: string, data: Partial<CreatePostData>): Promise<DbPost> {
    const response = await apiClient.put<ApiResponse<DbPost>>(`/posts/${id}`, data);
    return response.data.data;
  },

  /**
   * Deletes a post owned by the authenticated user.
   * @route DELETE /api/posts/:id
   */
  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },
};

export interface CreatePostData {
  title: string;
  description: string;
  tag: 'Service' | 'Request';
  price: DbPost['price'];
  images?: string[];
  hashtags?: string[];
  helpCategoryIds?: string[];
}

export default postService;
