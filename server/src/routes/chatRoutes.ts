import express from 'express';
import {
  getChatMessages,
  getConversations,
  sendChatMessage,
  markMessagesAsRead,
  deleteChatMessage,
  muteConversation,
  unmuteConversation,
  getUnreadCount,
  deleteConversation,
  pinConversation,
  unpinConversation
} from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.get('/', protect, getConversations);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:username', protect, getChatMessages);
router.post('/', protect, sendChatMessage);
router.put('/:username/read', protect, markMessagesAsRead);
router.delete('/message/:messageId', protect, deleteChatMessage);
router.delete('/conversation/:username', protect, deleteConversation);
router.post('/:username/mute', protect, muteConversation);
router.delete('/:username/mute', protect, unmuteConversation);
router.post('/:username/pin', protect, pinConversation);
router.delete('/:username/pin', protect, unpinConversation);

export default router;