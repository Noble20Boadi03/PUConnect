import express from 'express';
import {
  getReports,
  updateReportStatus,
  getUsers,
  getUserDetail,
  updateUserStatus,
  updatePostStatus,
  getPosts,
  getPostDetail,
  getAnalytics,
  getAuditLogs
} from '../controllers/adminController';
import {
  getDashboard,
  triageReport,
  getPendingProviders,
  reviewProvider,
  warnUser,
  bulkUpdatePostStatus,
  updatePostImages,
  getDisputes,
  getDisputeDetail,
  resolveDispute,
  getFeedback,
  updateFeedbackStatus,
} from '../controllers/adminExtendedController';
import { protect, requireAdmin } from '../middlewares/authMiddleware';
import { requireAdminSection } from '../middlewares/adminAccess';

const router = express.Router();

router.use(protect, requireAdmin);

// Dashboard (super_admin only)
router.get('/dashboard', requireAdminSection('dashboard'), getDashboard);
router.get('/analytics', requireAdminSection('dashboard'), getAnalytics);
router.get('/audit-logs', requireAdminSection('dashboard'), getAuditLogs);

// Moderation
router.get('/reports', requireAdminSection('moderation'), getReports);
router.patch('/reports/:id', requireAdminSection('moderation'), updateReportStatus);
router.post('/reports/:id/triage', requireAdminSection('moderation'), triageReport);
router.get('/disputes', requireAdminSection('moderation'), getDisputes);
router.get('/disputes/:id', requireAdminSection('moderation'), getDisputeDetail);
router.patch('/disputes/:id/resolve', requireAdminSection('moderation'), resolveDispute);
router.get('/feedback', requireAdminSection('moderation'), getFeedback);
router.patch('/feedback/:id', requireAdminSection('moderation'), updateFeedbackStatus);

// Directory
router.get('/users', requireAdminSection('directory'), getUsers);
router.get('/users/:id', requireAdminSection('directory'), getUserDetail);
router.patch('/users/:id/status', requireAdminSection('directory'), updateUserStatus);
router.post('/users/:id/warn', requireAdminSection('directory'), warnUser);
router.get('/providers/pending', requireAdminSection('directory'), getPendingProviders);
router.patch('/providers/:id/review', requireAdminSection('directory'), reviewProvider);

// Content
router.get('/posts', requireAdminSection('content'), getPosts);
router.get('/posts/:id', requireAdminSection('content'), getPostDetail);
router.patch('/posts/:id/status', requireAdminSection('content'), updatePostStatus);
router.patch('/posts/bulk-status', requireAdminSection('content'), bulkUpdatePostStatus);
router.patch('/posts/:id/images', requireAdminSection('content'), updatePostImages);

export default router;
