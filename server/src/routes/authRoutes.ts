import { Router } from 'express';
import { register, login, logout, getMe, deleteAccount, revokeProviderStatus, forgotPassword, verifyOTP, resetPassword, changePassword } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes (require JWT verification)
router.get('/me', protect, getMe);
router.delete('/delete-account', protect, deleteAccount);
router.patch('/revoke-provider', protect, revokeProviderStatus);
router.post('/change-password', protect, changePassword);

export default router;
