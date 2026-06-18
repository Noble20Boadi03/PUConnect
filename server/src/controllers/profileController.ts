import { Request, Response } from 'express';
import prisma from '../config/db';

const safeUserSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  role: true,
  bio: true,
  categoryId: true,
  skillTitle: true,
  expertiseTags: true,
  serviceIds: true,
  createdAt: true,
  updatedAt: true
};

const postSelect = { 
  id: true, 
  title: true, 
  description: true, 
  tag: true, 
  price: true, 
  images: true, 
  hashtags: true, 
  helpCategoryIds: true, 
  authorId: true, 
  createdAt: true, 
  updatedAt: true 
};

/**
 * Get user profile by username
 * @route GET /api/profile/:username
 */
export const getProfile = async (req: Request, res: Response) => {
  console.log('[TIMESTAMP] getProfile start:', new Date().toISOString(), 'username:', req.params.username);
  try {
    const { username } = req.params;
    console.log('[TIMESTAMP] getProfile before findUnique user:', new Date().toISOString());
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        ...safeUserSelect,
        category: true,
        posts: { orderBy: { createdAt: 'desc' }, select: postSelect },
        receivedReviews: { 
          include: { 
            reviewer: { select: safeUserSelect } 
          } 
        }
      }
    });
    console.log('[TIMESTAMP] getProfile after findUnique user:', new Date().toISOString());
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    console.log('[TIMESTAMP] getProfile before categoryServices:', new Date().toISOString());
    const categoryServices = user.serviceIds && user.serviceIds.length > 0
      ? await prisma.categoryService.findMany({
          where: { id: { in: user.serviceIds } }
        })
      : [];

    const safeUserWithServices = {
      ...user,
      services: categoryServices.map(cs => ({
        id: cs.id,
        title: cs.title,
        categoryId: cs.categoryId
      }))
    };

    console.log('[TIMESTAMP] getProfile before sending response:', new Date().toISOString());
    return res.status(200).json({
      status: 200,
      data: safeUserWithServices
    });
  } catch (error) {
    console.error('GetProfile error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Update authenticated user's profile
 * @route PUT /api/profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      name,
      username,
      bio,
      avatarUrl,
      categoryId,
      skillTitle,
      expertiseTags,
      serviceIds,
      role
    } = req.body;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
        select: { id: true }
      });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: 'Username already taken'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        bio,
        avatarUrl,
        categoryId,
        skillTitle,
        expertiseTags,
        serviceIds,
        role
      },
      select: {
        ...safeUserSelect,
        category: true
      }
    });

    const categoryServices = updatedUser.serviceIds && updatedUser.serviceIds.length > 0
      ? await prisma.categoryService.findMany({
          where: { id: { in: updatedUser.serviceIds } }
        })
      : [];

    const safeUserWithServices = {
      ...updatedUser,
      services: categoryServices.map(cs => ({
        id: cs.id,
        title: cs.title,
        categoryId: cs.categoryId
      }))
    };

    return res.status(200).json({
      status: 200,
      message: 'Profile updated successfully',
      data: safeUserWithServices
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};