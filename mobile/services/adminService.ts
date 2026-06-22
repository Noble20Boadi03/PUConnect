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
  status: 'active' | 'shadowbanned' | 'suspended' | 'banned';
  avatarUrl: string;
  createdAt: string;
  reportCount: number;
}

export interface AdminUserDetail extends Omit<AdminUser, 'reportCount'> {
  bio: string;
  updatedAt: string;
  adminTier?: string | null;
  providerApprovalStatus?: string;
  categoryId?: string | null;
  skillTitle?: string | null;
  expertiseTags?: string[];
  serviceIds?: string[];
  reports: Report[];
}

export interface AdminPost {
  id: string;
  title: string;
  description?: string;
  tag: string;
  authorId: string;
  authorUsername: string;
  authorName?: string;
  price: any;
  images?: string[];
  hashtags?: string[];
  status: 'active' | 'hidden_by_owner' | 'locked_by_admin' | 'removed_by_admin';
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

export interface DashboardData {
  pendingReports: number;
  pendingProviders: number;
  pendingDisputes: number;
  openFeedback: number;
  recentAuditLogs: AuditLog[];
}

export interface PendingProvider {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  categoryId: string | null;
  skillTitle: string | null;
  expertiseTags: string[];
  serviceIds: string[];
  providerAppliedAt: string | null;
  createdAt: string;
}

export interface DisputeSummary {
  id: string;
  status: string;
  message: string | null;
  completionRequestedAt: string | null;
  requester: ReportTargetUser;
  provider: ReportTargetUser;
  post: { id: string; title: string; tag: string } | null;
}

export interface DisputeDetail extends DisputeSummary {
  messages: Array<{
    id: string;
    content: string;
    kind: string;
    createdAt: string;
    sender: ReportTargetUser;
    receiver: ReportTargetUser;
  }>;
}

export interface FeedbackItem {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  user: ReportTargetUser;
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

  getDisputes: async (page: number = 1): Promise<PaginatedResponse<DisputeSummary>> => {
    const response = await apiClient.get('/admin/disputes', { params: { page } });
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
