import express from 'express';
import {
  getReviewsForUser,
  getEligibleReviews,
  createReview,
} from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/eligible/me', protect, getEligibleReviews);
router.get('/:username', getReviewsForUser);
router.post('/', protect, createReview);

export default router;
