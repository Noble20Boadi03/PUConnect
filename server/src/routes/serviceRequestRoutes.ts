import express from 'express';
import {
  getServiceRequests,
  getServiceRequestById,
  getServiceRequestForChat,
  getActiveServiceRequestCount,
  getPostServiceStatus,
  createServiceRequest,
  transitionServiceRequest,
  updateServiceRequest,
  acceptServiceRequest,
  declineServiceRequest,
} from '../controllers/serviceRequestController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getServiceRequests);
router.get('/active-count', protect, getActiveServiceRequestCount);
router.get('/chat', protect, getServiceRequestForChat);
router.get('/:id', protect, getServiceRequestById);
router.get('/post/:postId/status', protect, getPostServiceStatus);
router.post('/', protect, createServiceRequest);
router.patch('/:id/transition', protect, transitionServiceRequest);
router.patch('/:id/accept', protect, acceptServiceRequest);
router.patch('/:id/decline', protect, declineServiceRequest);
router.put('/:id', protect, updateServiceRequest);

export default router;
