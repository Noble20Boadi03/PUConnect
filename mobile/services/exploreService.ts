import { apiClient } from './apiClient';
import type { ApiResponse, DbCategory, DbCategoryService, User } from '../types';

/**
 * Explore-related API actions (categories, sub-services, and provider discovery).
 */
export const exploreService = {
  /**
   * Fetches all explore categories.
   * @route GET /api/explore/categories
   */
  async getCategories(): Promise<DbCategory[]> {
    const response = await apiClient.get<ApiResponse<DbCategory[]>>('/explore/categories');
    return response.data.data;
  },

  /**
   * Fetches a specific category by ID.
   * @route GET /api/explore/categories/:id
   */
  async getCategoryById(id: string): Promise<DbCategory> {
    const response = await apiClient.get<ApiResponse<DbCategory>>(`/explore/categories/${id}`);
    return response.data.data;
  },

  /**
   * Fetches all category services.
   * @route GET /api/explore/category-services
   */
  async getCategoryServices(): Promise<DbCategoryService[]> {
    const response = await apiClient.get<ApiResponse<DbCategoryService[]>>('/explore/category-services');
    return response.data.data;
  },

  /**
   * Fetches users who are providers.
   * @route GET /api/explore/providers
   */
  async getExploreProviders(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/explore/providers');
    return response.data.data;
  },
};

export default exploreService;
