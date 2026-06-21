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
