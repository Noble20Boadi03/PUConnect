import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Create a new report
 * @route POST /api/reports
 */
export const createReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide targetType, targetId, and reason.',
      });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetType,
        targetId,
        reason,
        description,
      },
    });

    return res.status(201).json({
      status: 201,
      message: 'Report created successfully.',
      data: report,
    });
  } catch (error) {
    console.error('CreateReport error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error creating report.',
    });
  }
};

/**
 * Create new feedback
 * @route POST /api/feedback
 */
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide a feedback message.',
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        message,
      },
    });

    return res.status(201).json({
      status: 201,
      message: 'Feedback created successfully.',
      data: feedback,
    });
  } catch (error) {
    console.error('CreateFeedback error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error creating feedback.',
    });
  }
};
