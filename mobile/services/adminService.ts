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

export const adminService = {
  getReports: async (status?: string): Promise<Report[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/admin/reports', { params });
    return response.data.data;
  },

  updateReportStatus: async (id: string, status: string): Promise<Report> => {
    const response = await apiClient.patch(`/admin/reports/${id}`, { status });
    return response.data.data;
  },

  getUsers: async (params?: { search?: string; role?: string; status?: string }): Promise<AdminUser[]> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data.data;
  },

  getUserDetail: async (id: string): Promise<AdminUserDetail> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data.data;
  },

  updateUserStatus: async (id: string, status: string): Promise<ReportTargetUser> => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return response.data.data;
  },

  getPosts: async (params?: { search?: string; tag?: string; status?: string }): Promise<AdminPost[]> => {
    const response = await apiClient.get('/admin/posts', { params });
    return response.data.data;
  },

  getPostDetail: async (id: string): Promise<AdminPostDetail> => {
    const response = await apiClient.get(`/admin/posts/${id}`);
    return response.data.data;
  },

  updatePostStatus: async (id: string, status: string): Promise<ReportTargetPost> => {
    const response = await apiClient.patch(`/admin/posts/${id}/status`, { status });
    return response.data.data;
  },
};

export default adminService;
