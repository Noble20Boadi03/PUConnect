import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Get all posts (market feed)
 * @route GET /api/posts
 */
export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({
      status: 200,
      data: posts,
    });
  } catch (error) {
    console.error('GetPosts Error:', error);
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
      include: { author: true },
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
    console.error('GetPostById Error:', error);
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
    const { title, description, tag, price, images, hashtags } = req.body;

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
        authorId: userId,
      },
      include: { author: true },
    });

    return res.status(201).json({
      status: 201,
      message: 'Post created successfully.',
      data: post,
    });
  } catch (error) {
    console.error('CreatePost Error:', error);
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
    const { title, description, tag, price, images, hashtags } = req.body;

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

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        description,
        tag,
        price,
        images,
        hashtags,
      },
      include: { author: true },
    });

    return res.status(200).json({
      status: 200,
      message: 'Post updated successfully.',
      data: updatedPost,
    });
  } catch (error) {
    console.error('UpdatePost Error:', error);
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
