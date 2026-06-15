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
      where: { username },
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id },
      include: { reviewer: true, reviewee: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({
      status: 200,
      data: reviews,
    });
  } catch (error) {
    console.error('GetReviewsForUser error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
    });
  }
};

/**
 * Get reviewable completed service requests for the authenticated user
 * @route GET /api/reviews/eligible/me
 */
export const getEligibleReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const completedRequests = await prisma.serviceRequest.findMany({
      where: {
        requesterId: userId,
        status: 'completed',
      },
      include: {
        provider: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        post: true,
        reviews: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    const eligible = completedRequests.filter((r) => r.reviews.length === 0);

    return res.status(200).json({
      status: 200,
      data: eligible,
    });
  } catch (error) {
    console.error('GetEligibleReviews error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
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
    const { revieweeUsername, rating, comment, serviceTitle, serviceRequestId, postId } = req.body;

    const reviewee = await prisma.user.findUnique({
      where: { username: revieweeUsername },
    });
    if (!reviewee) {
      return res.status(404).json({
        status: 404,
        message: 'Reviewee not found',
      });
    }

    let resolvedServiceTitle = serviceTitle as string | undefined;
    let resolvedPostId = postId as string | undefined;

    if (serviceRequestId) {
      const serviceRequest = await prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId },
        include: { reviews: true, post: true },
      });
      if (!serviceRequest) {
        return res.status(404).json({
          status: 404,
          message: 'Service request not found',
        });
      }
      if (serviceRequest.requesterId !== reviewerId) {
        return res.status(403).json({
          status: 403,
          message: 'Only the client who completed the official undertaking can leave a review',
        });
      }
      if (serviceRequest.status !== 'completed') {
        return res.status(400).json({
          status: 400,
          message: 'Official undertaking must be completed before reviewing',
        });
      }
      if (serviceRequest.reviews.length > 0) {
        return res.status(409).json({
          status: 409,
          message: 'You have already reviewed this undertaking',
        });
      }
      if (serviceRequest.providerId !== reviewee.id) {
        return res.status(400).json({
          status: 400,
          message: 'Reviewee does not match the service provider',
        });
      }
      resolvedServiceTitle = resolvedServiceTitle ?? serviceRequest.post?.title ?? undefined;
      resolvedPostId = resolvedPostId ?? serviceRequest.postId ?? undefined;
    }

    const review = await prisma.review.create({
      data: {
        reviewerId,
        revieweeId: reviewee.id,
        rating,
        comment,
        serviceTitle: resolvedServiceTitle ?? null,
        serviceRequestId: serviceRequestId ?? null,
        postId: resolvedPostId ?? null,
      },
      include: { reviewer: true, reviewee: true },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: reviewee.id,
        kind: 'service',
        title: 'New Review',
        body: `${review.reviewer.name} left you a ${rating}-star review.`,
      },
    });

    io.to(reviewee.id).emit('newNotification', notification);

    return res.status(201).json({
      status: 201,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    console.error('CreateReview error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
    });
  }
};
