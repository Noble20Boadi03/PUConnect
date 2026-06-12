import express from 'express';
import { getReviewsForUser, createReview } from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public route - get reviews for a user
router.get('/:username', getReviewsForUser);

// Protected route - create a review
router.post('/', protect, createReview);

export default router;