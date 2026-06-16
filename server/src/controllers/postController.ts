import { Request, Response } from 'express';
import prisma from '../config/db';
import { supabase } from '../config/supabase';

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

/**
 * Extract file path from Supabase public URL
 */
const extractFilePathFromUrl = (url: string): string | null => {
  try {
    // The public URL format is: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
    const pathMatch = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
};

/**
 * Delete images from Supabase storage
 */
const deleteImagesFromStorage = async (imageUrls: string[]) => {
  const filePaths = imageUrls.map(extractFilePathFromUrl).filter(Boolean) as string[];
  if (filePaths.length > 0) {
    await supabase.storage.from('avatars').remove(filePaths);
  }
};

/**
 * Get all posts (market feed)
 * @route GET /api/posts
 */
export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({
      status: 200,
      data: posts,
    });
  } catch (error) {
    console.error('GetPosts error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving posts.',
    });
  }
};

/**
 * Get a single post by ID
 * @route GET /api/posts/:id
 */
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: safeUserSelect } },
    });
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found.',
      });
    }
    return res.status(200).json({
      status: 200,
      data: post,
    });
  } catch (error) {
    console.error('GetPostById error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving post.',
    });
  }
};

/**
 * Create a new post
 * @route POST /api/posts
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, description, tag, price, images, hashtags, helpCategoryIds } = req.body;

    if (!title || !description || !tag) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide title, description, and tag.',
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        description,
        tag,
        price,
        images: images || [],
        hashtags: hashtags || [],
        helpCategoryIds: helpCategoryIds || [],
        authorId: userId,
      },
      include: { author: { select: safeUserSelect } },
    });

    return res.status(201).json({
      status: 201,
      message: 'Post created successfully.',
      data: post,
    });
  } catch (error) {
    console.error('CreatePost error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error creating post.',
    });
  }
};

/**
 * Update a post
 * @route PUT /api/posts/:id
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, description, tag, price, images, hashtags, helpCategoryIds } = req.body;

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found.',
      });
    }
    if (post.authorId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'You are not authorized to update this post.',
      });
    }

    // Find images that were removed and delete them
    const oldImages = post.images || [];
    const newImages = images || [];
    const removedImages = oldImages.filter((img) => !newImages.includes(img));
    if (removedImages.length > 0) {
      await deleteImagesFromStorage(removedImages);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        description,
        tag,
        price,
        images,
        hashtags,
        helpCategoryIds,
      },
      include: { author: { select: safeUserSelect } },
    });

    return res.status(200).json({
      status: 200,
      message: 'Post updated successfully.',
      data: updatedPost,
    });
  } catch (error) {
    console.error('UpdatePost error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error updating post.',
    });
  }
};

/**
 * Delete a post
 * @route DELETE /api/posts/:id
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found.',
      });
    }
    if (post.authorId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'You are not authorized to delete this post.',
      });
    }

    // Delete all images associated with the post
    if (post.images && post.images.length > 0) {
      await deleteImagesFromStorage(post.images);
    }

    await prisma.post.delete({ where: { id } });

    return res.status(200).json({
      status: 200,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    console.error('DeletePost Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error deleting post.',
    });
  }
};
