import { Router } from 'express';
import { register, login, logout, getMe, updatePreferences } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (require JWT verification)
router.get('/me', protect, getMe);
router.patch('/preferences', protect, updatePreferences);

export default router;
