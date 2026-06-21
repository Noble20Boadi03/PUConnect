import express from 'express';
import { createReport, createFeedback } from '../controllers/reportController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createReport);
router.post('/feedback', authMiddleware, createFeedback);

export default router;
