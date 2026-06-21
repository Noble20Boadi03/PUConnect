import { Request, Response } from 'express';
import prisma from '../config/db';

const safeUserSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  status: true
};

/**
 * Get all reports (admin only)
 * @route GET /admin/reports
 */
export const getReports = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      include: { reporter: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' }
    });

    // Resolve targets
    const resolvedReports = await Promise.all(
      reports.map(async (report) => {
        let target: any = null;
        if (report.targetType === 'user') {
          target = await prisma.user.findUnique({
            where: { id: report.targetId },
            select: safeUserSelect
          });
        } else if (report.targetType === 'post') {
          target = await prisma.post.findUnique({
            where: { id: report.targetId },
            select: { id: true, title: true, status: true }
          });
        }
        return { ...report, target };
      })
    );

    return res.status(200).json({
      status: 200,
      data: resolvedReports
    });
  } catch (error) {
    console.error('GetReports error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving reports.'
    });
  }
};

/**
 * Update report status (admin only)
 * @route PATCH /admin/reports/:id
 */
export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = (req as any).user.id;

    if (!['reviewed', 'dismissed', 'actioned'].includes(status)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid status. Must be reviewed, dismissed, or actioned.'
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: adminId
      },
      include: { reporter: { select: safeUserSelect } }
    });

    return res.status(200).json({
      status: 200,
      message: 'Report status updated successfully.',
      data: updatedReport
    });
  } catch (error) {
    console.error('UpdateReportStatus error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error updating report status.'
    });
  }
};

/**
 * Update user status (admin only)
 * @route PATCH /admin/users/:id/status
 */
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid status. Must be active, suspended, or banned.'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: safeUserSelect
    });

    return res.status(200).json({
      status: 200,
      message: 'User status updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    console.error('UpdateUserStatus error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error updating user status.'
    });
  }
};

/**
 * Update post status (admin only)
 * @route PATCH /admin/posts/:id/status
 */
export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'hidden_by_owner', 'removed_by_admin'].includes(status)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid status. Must be active, hidden_by_owner, or removed_by_admin.'
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, status: true }
    });

    return res.status(200).json({
      status: 200,
      message: 'Post status updated successfully.',
      data: updatedPost
    });
  } catch (error) {
    console.error('UpdatePostStatus error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error updating post status.'
    });
  }
};
