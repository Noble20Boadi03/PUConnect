import express from 'express';
import {
  getServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequest
} from '../controllers/serviceRequestController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.get('/', protect, getServiceRequests);
router.get('/:id', protect, getServiceRequestById);
router.post('/', protect, createServiceRequest);
router.put('/:id', protect, updateServiceRequest);

export default router;