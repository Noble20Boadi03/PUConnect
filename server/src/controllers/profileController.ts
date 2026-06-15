import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Get user profile by username
 * @route GET /api/profile/:username
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        category: true,
        posts: { orderBy: { createdAt: 'desc' } },
        receivedReviews: { include: { reviewer: true } }
      }
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    const categoryServices = user.serviceIds && user.serviceIds.length > 0
      ? await prisma.categoryService.findMany({
          where: { id: { in: user.serviceIds } }
        })
      : [];

    // Don't send password back
    const { password, otpCode, otpExpires, ...safeUser } = user;
    const safeUserWithServices = {
      ...safeUser,
      services: categoryServices.map(cs => ({
        id: cs.id,
        title: cs.title,
        categoryId: cs.categoryId
      }))
    };

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
        where: { username, NOT: { id: userId } }
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
      include: {
        category: true
      }
    });

    const categoryServices = updatedUser.serviceIds && updatedUser.serviceIds.length > 0
      ? await prisma.categoryService.findMany({
          where: { id: { in: updatedUser.serviceIds } }
        })
      : [];

    const { password, otpCode, otpExpires, ...safeUser } = updatedUser;
    const safeUserWithServices = {
      ...safeUser,
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