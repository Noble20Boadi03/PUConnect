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

    // Get report counts for each user using batched query
    const userIds = users.map(user => user.id);
    let reportCountsMap: Record<string, number> = {};
    
    if (userIds.length > 0) {
      const reportCounts = await prisma.report.groupBy({
        by: ['targetId'],
        where: {
          targetType: 'user',
          targetId: { in: userIds }
        },
        _count: true
      });

      reportCountsMap = reportCounts.reduce((acc, item) => {
        acc[item.targetId] = item._count;
        return acc;
      }, {} as Record<string, number>);
    }

    const usersWithReportCounts = users.map((user) => ({
      ...user,
      reportCount: reportCountsMap[user.id] || 0
    }));

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

    const postIds = posts.map(post => post.id);
    let reportCountsMap: Record<string, number> = {};
    
    if (postIds.length > 0) {
      const reportCounts = await prisma.report.groupBy({
        by: ['targetId'],
        where: {
          targetType: 'post',
          targetId: { in: postIds }
        },
        _count: true
      });

      reportCountsMap = reportCounts.reduce((acc, item) => {
        acc[item.targetId] = item._count;
        return acc;
      }, {} as Record<string, number>);
    }

    const postsWithReportCounts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      tag: post.tag,
      authorId: post.authorId,
      authorUsername: post.author?.username || 'Deleted User',
      price: post.price,
      status: post.status,
      createdAt: post.createdAt,
      reportCount: reportCountsMap[post.id] || 0
    }));

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
export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all database queries in parallel using Promise.all (now 7 total queries!)
    const [
      userMetrics,
      postMetrics,
      srMetrics,
      reviewMetrics,
      reportMetrics,
      signupsRaw,
      reportsRaw
    ] = await Promise.all([
      // User metrics (1 raw query instead of 4)
      prisma.$queryRaw`
        SELECT
          COUNT(*)::int as "totalUsers",
          SUM(CASE WHEN "role" = 'provider' THEN 1 ELSE 0 END)::int as "providerCount",
          SUM(CASE WHEN "lastLoginAt" >= ${sevenDaysAgo} THEN 1 ELSE 0 END)::int as "activeUsers7d",
          SUM(CASE WHEN "lastLoginAt" >= ${thirtyDaysAgo} THEN 1 ELSE 0 END)::int as "activeUsers30d"
        FROM users;
      ` as unknown as any[],
      // Post metrics (1 groupBy instead of 3)
      prisma.post.groupBy({
        by: ['tag'],
        _count: { tag: true }
      }),
      // Service Request metrics (1 groupBy instead of 6)
      prisma.serviceRequest.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      // Review metrics (1 raw query instead of 1 findMany + client-side calc)
      prisma.$queryRaw`
        SELECT
          COUNT(*)::int as "totalReviews",
          AVG("rating")::float as "averageRating"
        FROM reviews;
      ` as unknown as any[],
      // Report metrics (1 groupBy instead of 5)
      prisma.report.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      // Time-series: 30d signups (raw SQL)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt")::date as date,
          COUNT(*)::int as count
        FROM users
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY date
        ORDER BY date ASC;
      ` as unknown as any[],
      // Time-series: 30d reports (raw SQL)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt")::date as date,
          COUNT(*)::int as count
        FROM reports
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY date
        ORDER BY date ASC;
      ` as unknown as any[]
    ]);

    // Extract user metrics
    const { totalUsers, providerCount, activeUsers7d, activeUsers30d } = userMetrics[0];
    const nonProviderCount = totalUsers - providerCount;

    // Extract post metrics
    const postMetricsMap = new Map(postMetrics.map(p => [p.tag, p._count.tag]));
    const totalPosts = postMetrics.reduce((sum, p) => sum + p._count.tag, 0);
    const servicePostCount = postMetricsMap.get('Service') || 0;
    const requestPostCount = postMetricsMap.get('Request') || 0;

    // Extract service request metrics
    const srMetricsMap = new Map(srMetrics.map(s => [s.status, s._count.status]));
    const serviceRequestsByStatus = {
      pending: srMetricsMap.get('pending') || 0,
      active: srMetricsMap.get('active') || 0,
      pending_review: srMetricsMap.get('pending_review') || 0,
      completed: srMetricsMap.get('completed') || 0,
      cancelled: srMetricsMap.get('cancelled') || 0,
      declined: srMetricsMap.get('declined') || 0,
    };

    // Extract review metrics
    const { totalReviews, averageRating } = reviewMetrics[0];
    const averageReviewRating = totalReviews > 0 ? (averageRating || 0) : 0;

    // Extract report metrics
    const reportMetricsMap = new Map(reportMetrics.map(r => [r.status, r._count.status]));
    const totalReports = reportMetrics.reduce((sum, r) => sum + r._count.status, 0);
    const reportsByStatus = {
      pending: reportMetricsMap.get('pending') || 0,
      reviewed: reportMetricsMap.get('reviewed') || 0,
      dismissed: reportMetricsMap.get('dismissed') || 0,
      actioned: reportMetricsMap.get('actioned') || 0,
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
