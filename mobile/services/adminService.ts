import apiClient from './apiClient';

export interface ReportTargetUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  status: string;
}

export interface ReportTargetPost {
  id: string;
  title: string;
  status: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'post';
  targetId: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reporter: ReportTargetUser;
  target: ReportTargetUser | ReportTargetPost | null;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'user' | 'provider' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  avatarUrl: string;
  createdAt: string;
  reportCount: number;
}

export interface AdminUserDetail extends Omit<AdminUser, 'reportCount'> {
  bio: string;
  updatedAt: string;
  reports: Report[];
}

export interface AdminPost {
  id: string;
  title: string;
  tag: string;
  authorId: string;
  authorUsername: string;
  price: any;
  status: 'active' | 'hidden_by_owner' | 'removed_by_admin';
  createdAt: string;
  reportCount: number;
}

export interface AdminPostDetail extends Omit<AdminPost, 'authorUsername' | 'reportCount'> {
  description: string;
  images: string[];
  hashtags: string[];
  helpCategoryIds: string[];
  author: ReportTargetUser;
  updatedAt: string;
  reports: Report[];
}

export interface AnalyticsData {
  totalUsers: number;
  providerCount: number;
  nonProviderCount: number;
  activeUsers7d: number;
  activeUsers30d: number;
  totalPosts: number;
  servicePostCount: number;
  requestPostCount: number;
  serviceRequestsByStatus: {
    pending: number;
    active: number;
    pending_review: number;
    completed: number;
    cancelled: number;
    declined: number;
  };
  averageReviewRating: number;
  totalReports: number;
  reportsByStatus: {
    pending: number;
    reviewed: number;
    dismissed: number;
    actioned: number;
  };
  signupsLast30Days: { date: string; count: number }[];
  reportsLast30Days: { date: string; count: number }[];
}

export interface AuditLogAdmin {
  id: string;
  username: string;
  name: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  fromValue: string | null;
  toValue: string | null;
  reason: string | null;
  createdAt: string;
  admin: AuditLogAdmin;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export const adminService = {
  getReports: async (status?: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Report>> => {
    const params: any = { page, limit };
    if (status) params.status = status;
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
  },

  updateReportStatus: async (id: string, status: string): Promise<Report> => {
    const response = await apiClient.patch(`/admin/reports/${id}`, { status });
    return response.data.data;
  },

  getUsers: async (params?: { search?: string; role?: string; status?: string }, page: number = 1, limit: number = 20): Promise<PaginatedResponse<AdminUser>> => {
    const requestParams: any = { page, limit, ...params };
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

  getPosts: async (params?: { search?: string; tag?: string; status?: string }, page: number = 1, limit: number = 20): Promise<PaginatedResponse<AdminPost>> => {
    const requestParams: any = { page, limit, ...params };
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
