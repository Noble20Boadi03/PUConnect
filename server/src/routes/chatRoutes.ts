import express from 'express';
import {
  getChatMessages,
  getConversations,
  sendChatMessage,
  markMessagesAsRead,
  deleteChatMessage,
  muteConversation,
  unmuteConversation
} from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.get('/', protect, getConversations);
router.get('/:username', protect, getChatMessages);
router.post('/', protect, sendChatMessage);
router.put('/:username/read', protect, markMessagesAsRead);
router.delete('/message/:messageId', protect, deleteChatMessage);
router.post('/:username/mute', protect, muteConversation);
router.delete('/:username/mute', protect, unmuteConversation);

export default router;