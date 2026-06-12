import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllNotificationsAsRead);

export default router;