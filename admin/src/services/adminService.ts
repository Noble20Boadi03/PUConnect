import apiClient from '../lib/apiClient';
import type {
  Report,
  AdminUser,
  AdminUserDetail,
  AdminPost,
  AdminPostDetail,
  DashboardData,
  PendingProvider,
  DisputeSummary,
  DisputeDetail,
  FeedbackItem,
  AnalyticsData,
  AuditLog,
  PaginatedResponse,
  ReportTargetUser,
  ReportTargetPost,
} from '../types/admin';

export const adminService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  getReports: async (status?: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Report>> => {
    const params: any = { page, limit };
    if (status && status !== 'all') params.status = status;
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
  },

  getReportDetail: async (id: string): Promise<Report> => {
    const response = await apiClient.get(`/admin/reports/${id}`);
    return response.data.data;
  },

  updateReportStatus: async (id: string, status: string): Promise<Report> => {
    const response = await apiClient.patch(`/admin/reports/${id}`, { status });
    return response.data.data;
  },

  triageReport: async (id: string, action: 'dismiss' | 'remove_content' | 'suspend_user'): Promise<void> => {
    await apiClient.post(`/admin/reports/${id}/triage`, { action });
  },

  getUsers: async (params?: { search?: string; role?: string; status?: string; minReports?: string }, page: number = 1, limit: number = 20): Promise<PaginatedResponse<AdminUser>> => {
    const requestParams: any = { page, limit };
    if (params?.search) requestParams.search = params.search;
    if (params?.role && params.role !== 'all') requestParams.role = params.role;
    if (params?.status && params.status !== 'all') requestParams.status = params.status;
    const response = await apiClient.get('/admin/users', { params: requestParams });
    return response.data;
  },

  getUserDetail: async (id: string): Promise<AdminUserDetail> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data.data;
  },

  updateUserStatus: async (id: string, status: string): Promise<ReportTargetUser> => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return response.data.data;
  },

  updateAdminTier: async (id: string, adminTier: string | null): Promise<void> => {
    await apiClient.patch(`/admin/users/${id}/tier`, { adminTier });
  },

  warnUser: async (id: string, message: string): Promise<void> => {
    await apiClient.post(`/admin/users/${id}/warn`, { message });
  },

  getPendingProviders: async (page: number = 1): Promise<PaginatedResponse<PendingProvider>> => {
    const response = await apiClient.get('/admin/providers/pending', { params: { page } });
    return response.data;
  },

  reviewProvider: async (id: string, decision: 'approve' | 'reject', note?: string): Promise<void> => {
    await apiClient.patch(`/admin/providers/${id}/review`, { decision, note });
  },

  getPosts: async (params?: { search?: string; tag?: string; status?: string }, page: number = 1, limit: number = 20): Promise<PaginatedResponse<AdminPost>> => {
    const requestParams: any = { page, limit };
    if (params?.search) requestParams.search = params.search;
    if (params?.tag && params.tag !== 'all') requestParams.tag = params.tag;
    if (params?.status && params.status !== 'all') requestParams.status = params.status;
    const response = await apiClient.get('/admin/posts', { params: requestParams });
    return response.data;
  },

  getPostDetail: async (id: string): Promise<AdminPostDetail> => {
    const response = await apiClient.get(`/admin/posts/${id}`);
    return response.data.data;
  },

  updatePostStatus: async (id: string, status: string): Promise<ReportTargetPost> => {
    const response = await apiClient.patch(`/admin/posts/${id}/status`, { status });
    return response.data.data;
  },

  updatePostContent: async (id: string, data: { title?: string; description?: string }): Promise<void> => {
    await apiClient.patch(`/admin/posts/${id}/content`, data);
  },

  bulkUpdatePostStatus: async (ids: string[], status: string): Promise<{ count: number }> => {
    const response = await apiClient.patch('/admin/posts/bulk-status', { ids, status });
    return response.data.data;
  },

  updatePostImages: async (id: string, images: string[]): Promise<void> => {
    await apiClient.patch(`/admin/posts/${id}/images`, { images });
  },

  getDisputes: async (params?: { status?: string }, page: number = 1): Promise<PaginatedResponse<DisputeSummary>> => {
    const requestParams: any = { page };
    if (params?.status) requestParams.status = params.status;
    const response = await apiClient.get('/admin/disputes', { params: requestParams });
    return response.data;
  },

  getDisputeDetail: async (id: string): Promise<DisputeDetail> => {
    const response = await apiClient.get(`/admin/disputes/${id}`);
    return response.data.data;
  },

  resolveDispute: async (id: string, resolution: 'complete' | 'cancel' | 'resume', note?: string): Promise<void> => {
    await apiClient.patch(`/admin/disputes/${id}/resolve`, { resolution, note });
  },

  getFeedback: async (status?: string, page: number = 1): Promise<PaginatedResponse<FeedbackItem>> => {
    const params: any = { page };
    if (status) params.status = status;
    const response = await apiClient.get('/admin/feedback', { params });
    return response.data;
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await apiClient.get('/admin/analytics');
    return response.data.data;
  },

  getAuditLogs: async (
    params?: {
      adminId?: string;
      action?: string;
      targetType?: string;
      startDate?: string;
      endDate?: string;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<AuditLog>> => {
    const requestParams: any = { page, limit, ...params };
    const response = await apiClient.get('/admin/audit-logs', { params: requestParams });
    return response.data;
  },
};

export default adminService;