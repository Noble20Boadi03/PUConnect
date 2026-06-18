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
    console.log('[TIMESTAMP] 3. Before apiClient.post call in authService:', new Date().toISOString());
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

  /**
   * Deletes the authenticated user's account permanently.
   * @route DELETE /api/auth/delete-account
   */
  async deleteAccount(): Promise<LogoutResponse> {
    const response = await apiClient.delete<LogoutResponse>('/auth/delete-account');
    return response.data;
  },

  /**
   * Revokes the authenticated user's provider status.
   * @route PATCH /api/auth/revoke-provider
   */
  async revokeProviderStatus(): Promise<LogoutResponse> {
    const response = await apiClient.patch<LogoutResponse>('/auth/revoke-provider');
    return response.data;
  },

  /**
   * Updates the authenticated user's profile (name, username, email, avatarUrl).
   * @route PATCH /api/auth/update-profile
   */
  async updateProfile(data: {
    name?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/auth/update-profile', data);
    return response.data.data;
  },

  /**
   * Updates the authenticated user's provider profile.
   * @route PATCH /api/auth/update-provider-profile
   */
  async updateProviderProfile(data: {
    bio?: string;
    categoryId?: string;
    skillTitle?: string;
    expertiseTags?: string[];
    serviceIds?: string[];
  }): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>('/auth/update-provider-profile', data);
    return response.data.data;
  },

  /**
   * Sends a password reset OTP to user's email.
   * @route POST /api/auth/forgot-password
   */
  async forgotPassword(emailOrUsername: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { emailOrUsername });
    return response.data;
  },

  /**
   * Verifies if a password reset OTP is valid.
   * @route POST /api/auth/verify-otp
   */
  async verifyOTP(emailOrUsername: string, otp: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/verify-otp', { emailOrUsername, otp });
    return response.data;
  },

  /**
   * Resets user's password using valid OTP
   * @route POST /api/auth/reset-password
   */
  async resetPassword(emailOrUsername: string, otp: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/reset-password', { emailOrUsername, otp, newPassword, confirmPassword });
    return response.data;
  },

  /**
   * Changes authenticated user's password
   * @route POST /api/auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword, confirmNewPassword });
    return response.data;
  },

  /**
   * Updates authenticated user's push token
   * @route PUT /api/auth/push-token
   */
  async updatePushToken(pushToken: string | null): Promise<void> {
    await apiClient.put('/auth/push-token', { pushToken });
  },
};

export default authService;
