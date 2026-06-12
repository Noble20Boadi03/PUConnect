import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Get notifications for authenticated user
 * @route GET /api/notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({
      status: 200,
      data: notifications
    });
  } catch (error) {
    console.error('GetNotifications error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Mark a notification as read
 * @route PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    if (!notification) {
      return res.status(404).json({
        status: 404,
        message: 'Notification not found'
      });
    }
    if (notification.userId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    return res.status(200).json({
      status: 200,
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    console.error('MarkNotificationAsRead error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return res.status(200).json({
      status: 200,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('MarkAllNotificationsAsRead error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};