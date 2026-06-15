import { Request, Response } from 'express';
import prisma from '../config/db';
import { io } from '../index';

/**
 * Get reviews for a user
 * @route GET /api/reviews/:username
 */
export const getReviewsForUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username }
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id },
      include: { reviewer: true, reviewee: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({
      status: 200,
      data: reviews
    });
  } catch (error) {
    console.error('GetReviewsForUser error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Create a new review
 * @route POST /api/reviews
 */
export const createReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user.id;
    const { revieweeUsername, rating, comment, serviceTitle } = req.body;

    // Find reviewee
    const reviewee = await prisma.user.findUnique({
      where: { username: revieweeUsername }
    });
    if (!reviewee) {
      return res.status(404).json({
        status: 404,
        message: 'Reviewee not found'
      });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId,
        revieweeId: reviewee.id,
        rating,
        comment,
        serviceTitle
      },
      include: { reviewer: true, reviewee: true }
    });

    // Create a notification for the reviewee
    const notification = await prisma.notification.create({
      data: {
        userId: reviewee.id,
        kind: 'service',
        title: 'New Review',
        body: `${review.reviewer.name} left you a ${rating}-star review.`,
      }
    });

    // Emit real-time event to reviewee
    io.to(reviewee.id).emit('newNotification', notification);

    return res.status(201).json({
      status: 201,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('CreateReview error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};