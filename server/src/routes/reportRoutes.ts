import express from 'express';
import { createReport, createFeedback } from '../controllers/reportController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, createReport);
router.post('/feedback', protect, createFeedback);

export default router;
