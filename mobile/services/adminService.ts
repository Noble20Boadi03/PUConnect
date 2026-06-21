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

  updateUserStatus: async (id: string, status: string): Promise<ReportTargetUser> => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return response.data.data;
  },

  updatePostStatus: async (id: string, status: string): Promise<ReportTargetPost> => {
    const response = await apiClient.patch(`/admin/posts/${id}/status`, { status });
    return response.data.data;
  },
};

export default adminService;
