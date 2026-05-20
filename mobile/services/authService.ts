import { apiClient } from './apiClient';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiResponse,
  LogoutResponse,
  User,
} from '../types';

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
   * Notifies the server that the client is ending the session.
   * @route POST /api/auth/logout
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/auth/logout');
    return response.data;
  },

  /**
   * Fetches the authenticated user's profile.
   * @route GET /api/auth/me
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};

export default authService;
