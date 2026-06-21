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
 * Get all users (admin only)
 * @route GET /admin/users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, status } = req.query;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get report counts for each user
    const usersWithReportCounts = await Promise.all(
      users.map(async (user) => {
        const reportCount = await prisma.report.count({
          where: {
            targetType: 'user',
            targetId: user.id
          }
        });
        return { ...user, reportCount };
      })
    );

    return res.status(200).json({
      status: 200,
      data: usersWithReportCounts
    });
  } catch (error) {
    console.error('GetUsers error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving users.'
    });
  }
};

/**
 * Get single user detail (admin only)
 * @route GET /admin/users/:id
 */
export const getUserDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found.'
      });
    }

    // Get reports against this user
    const reports = await prisma.report.findMany({
      where: {
        targetType: 'user',
        targetId: id
      },
      include: { reporter: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      status: 200,
      data: { ...user, reports }
    });
  } catch (error) {
    console.error('GetUserDetail error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving user detail.'
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

/**
 * Get all posts (admin only)
 * @route GET /admin/posts
 */
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { search, tag, status } = req.query;

    const where: any = {};

    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    if (tag) {
      where.tag = tag;
    }

    if (status) {
      where.status = status;
    }

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        tag: true,
        authorId: true,
        author: { select: { username: true } },
        price: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const postsWithReportCounts = await Promise.all(
      posts.map(async (post) => {
        const reportCount = await prisma.report.count({
          where: {
            targetType: 'post',
            targetId: post.id
          }
        });
        return {
          id: post.id,
          title: post.title,
          tag: post.tag,
          authorId: post.authorId,
          authorUsername: post.author.username,
          price: post.price,
          status: post.status,
          createdAt: post.createdAt,
          reportCount
        };
      })
    );

    return res.status(200).json({
      status: 200,
      data: postsWithReportCounts
    });
  } catch (error) {
    console.error('GetPosts error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving posts.'
    });
  }
};

/**
 * Get single post detail (admin only)
 * @route GET /admin/posts/:id
 */
export const getPostDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        tag: true,
        price: true,
        images: true,
        hashtags: true,
        helpCategoryIds: true,
        authorId: true,
        author: { select: safeUserSelect },
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found.'
      });
    }

    const reports = await prisma.report.findMany({
      where: {
        targetType: 'post',
        targetId: id
      },
      include: { reporter: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      status: 200,
      data: { ...post, reports }
    });
  } catch (error) {
    console.error('GetPostDetail error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving post detail.'
    });
  }
};

/**
 * Get admin analytics dashboard data
 * @route GET /admin/analytics
 */
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User metrics
    const totalUsers = await prisma.user.count();
    const providerCount = await prisma.user.count({ where: { role: 'provider' } });
    const nonProviderCount = totalUsers - providerCount;
    const activeUsers7d = await prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } });
    const activeUsers30d = await prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } });

    // Post metrics
    const totalPosts = await prisma.post.count();
    const servicePostCount = await prisma.post.count({ where: { tag: 'Service' } });
    const requestPostCount = await prisma.post.count({ where: { tag: 'Request' } });

    // Service request metrics
    const serviceRequestsByStatus = {
      pending: await prisma.serviceRequest.count({ where: { status: 'pending' } }),
      active: await prisma.serviceRequest.count({ where: { status: 'active' } }),
      pending_review: await prisma.serviceRequest.count({ where: { status: 'pending_review' } }),
      completed: await prisma.serviceRequest.count({ where: { status: 'completed' } }),
      cancelled: await prisma.serviceRequest.count({ where: { status: 'cancelled' } }),
      declined: await prisma.serviceRequest.count({ where: { status: 'declined' } }),
    };

    // Review metrics
    const reviews = await prisma.review.findMany({ select: { rating: true } });
    const averageReviewRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    // Report metrics
    const totalReports = await prisma.report.count();
    const reportsByStatus = {
      pending: await prisma.report.count({ where: { status: 'pending' } }),
      reviewed: await prisma.report.count({ where: { status: 'reviewed' } }),
      dismissed: await prisma.report.count({ where: { status: 'dismissed' } }),
      actioned: await prisma.report.count({ where: { status: 'actioned' } }),
    };

    // Helper function to fill date gaps
    const fillDateGaps = (data: any[], startDate: Date, endDate: Date) => {
      const dateMap = new Map<string, number>();
      data.forEach(d => dateMap.set(d.date, d.count));

      const result = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: dateMap.get(dateStr) || 0
        });
        current.setDate(current.getDate() + 1);
      }
      return result;
    };

    // Signups last 30 days (raw SQL)
    const signupsRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt")::date as date,
        COUNT(*)::int as count
      FROM users
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY date
      ORDER BY date ASC;
    ` as any[];

    // Reports last 30 days (raw SQL)
    const reportsRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt")::date as date,
        COUNT(*)::int as count
      FROM reports
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY date
      ORDER BY date ASC;
    ` as any[];

    const signupsLast30Days = fillDateGaps(
      signupsRaw.map(r => ({ date: r.date.toISOString().split('T')[0], count: r.count })),
      thirtyDaysAgo,
      now
    );

    const reportsLast30Days = fillDateGaps(
      reportsRaw.map(r => ({ date: r.date.toISOString().split('T')[0], count: r.count })),
      thirtyDaysAgo,
      now
    );

    return res.status(200).json({
      status: 200,
      data: {
        totalUsers,
        providerCount,
        nonProviderCount,
        activeUsers7d,
        activeUsers30d,
        totalPosts,
        servicePostCount,
        requestPostCount,
        serviceRequestsByStatus,
        averageReviewRating,
        totalReports,
        reportsByStatus,
        signupsLast30Days,
        reportsLast30Days
      }
    });
  } catch (error) {
    console.error('GetAnalytics error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving analytics.'
    });
  }
};
