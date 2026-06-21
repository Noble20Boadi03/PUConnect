import apiClient from './apiClient';

export type ReportTargetType = 'user' | 'post';
export type ReportReason = 'spam' | 'harassment' | 'inappropriate_content' | 'scam' | 'other';

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export interface CreateFeedbackRequest {
  message: string;
}

export const reportService = {
  createReport: async (data: CreateReportRequest) => {
    const response = await apiClient.post('/reports', data);
    return response.data;
  },

  createFeedback: async (data: CreateFeedbackRequest) => {
    const response = await apiClient.post('/reports/feedback', data);
    return response.data;
  },
};
