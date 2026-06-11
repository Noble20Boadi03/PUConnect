import { Router } from 'express';
import { register, login, logout, getMe, deleteAccount } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (require JWT verification)
router.get('/me', protect, getMe);
router.delete('/delete-account', protect, deleteAccount);

export default router;
