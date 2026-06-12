import apiClient from './apiClient';
import type { DbPost } from '../types';

export interface GetPostsParams {
  tag?: 'Service' | 'Request';
  search?: string;
}

/**
 * Get all market posts (optionally filtered by type or search query)
 */
export const getPosts = async (params?: GetPostsParams): Promise<DbPost[]> => {
  const response = await apiClient.get('/posts', { params });
  return response.data.data;
};

/**
 * Get a single post by ID
 */
export const getPostById = async (id: string): Promise<DbPost> => {
  const response = await apiClient.get(`/posts/${id}`);
  return response.data.data;
};

/**
 * Create a new post
 */
export interface CreatePostData {
  title: string;
  description: string;
  tag: 'Service' | 'Request';
  price: any; // This should match your PostPrice type
  images?: string[];
  hashtags?: string[];
}

export const createPost = async (data: CreatePostData): Promise<DbPost> => {
  const response = await apiClient.post('/posts', data);
  return response.data.data;
};

/**
 * Update an existing post
 */
export const updatePost = async (id: string, data: Partial<CreatePostData>): Promise<DbPost> => {
  const response = await apiClient.put(`/posts/${id}`, data);
  return response.data.data;
};

/**
 * Delete a post
 */
export const deletePost = async (id: string): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};
