import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public route - get someone's profile by username
router.get('/:username', getProfile);

// Protected routes - update own profile
router.put('/', protect, updateProfile);

export default router;