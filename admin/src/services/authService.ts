import apiClient from '../lib/apiClient';
import type { AuthResponse, ApiResponse } from '../types/admin';

export const authService = {
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { emailOrUsername, password });
    return response.data.data!;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
};