import express from 'express';
import {
  getChatMessages,
  getConversations,
  sendChatMessage,
  markMessagesAsRead
} from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.get('/', protect, getConversations);
router.get('/:username', protect, getChatMessages);
router.post('/', protect, sendChatMessage);
router.put('/:username/read', protect, markMessagesAsRead);

export default router;