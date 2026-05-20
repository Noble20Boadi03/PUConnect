import { apiClient } from './apiClient';
import { LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse } from '../types';

/**
 * Authentication service for API requests related to login, registration, and logout.
 */
export const authService = {
  /**
   * Logs in a user with email and password.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * Registers a new user.
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { firstName, lastName, email, password, username } = credentials;
    const registerPayload = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      username,
    };
    
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', registerPayload);
    return response.data.data;
  },

  /**
   * Logs out the user session.
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
};

export default authService;
