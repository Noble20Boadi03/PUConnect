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

export type AdminTier = 'super_admin' | 'moderator' | 'support';
export type AdminSection = 'dashboard' | 'moderation' | 'directory' | 'content';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  adminTier?: AdminTier;
  avatarUrl?: string;
  bio?: string;
  categoryId?: string;
  skillTitle?: string;
  expertiseTags?: string[];
  serviceIds?: string[];
  services?: Array<{ id: string; title: string; categoryId: string }>;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}