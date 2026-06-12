import express from 'express';
import {
  getProviderServices,
  getProviderServiceById,
  createProviderService,
  updateProviderService,
  deleteProviderService
} from '../controllers/providerServiceController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getProviderServices);
router.get('/:id', getProviderServiceById);

// Protected routes
router.post('/', protect, createProviderService);
router.put('/:id', protect, updateProviderService);
router.delete('/:id', protect, deleteProviderService);

export default router;