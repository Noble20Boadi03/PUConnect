import express from 'express';
import {
  getReports,
  updateReportStatus,
  getUsers,
  getUserDetail,
  updateUserStatus,
  updatePostStatus
} from '../controllers/adminController';
import { protect, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// All admin routes require auth and admin role
router.use(protect, requireAdmin);

// Reports
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/status', updateUserStatus);

// Posts
router.patch('/posts/:id/status', updatePostStatus);

export default router;
