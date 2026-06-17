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
 * Get all explore categories
 * @route GET /api/explore/categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { services: true },
    });
    return res.status(200).json({
      status: 200,
      data: categories,
    });
  } catch (error) {
    console.error('GetCategories Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving categories.',
    });
  }
};

/**
 * Get a specific category by ID
 * @route GET /api/explore/categories/:id
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: id as any },
      include: { services: true },
    });
    if (!category) {
      return res.status(404).json({
        status: 404,
        message: 'Category not found.',
      });
    }
    return res.status(200).json({
      status: 200,
      data: category,
    });
  } catch (error) {
    console.error('GetCategoryById Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving category.',
    });
  }
};

/**
 * Get all category services
 * @route GET /api/explore/category-services
 */
export const getCategoryServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.categoryService.findMany();
    return res.status(200).json({
      status: 200,
      data: services,
    });
  } catch (error) {
    console.error('GetCategoryServices Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving category services.',
    });
  }
};

export const getExploreProviders = async (req: Request, res: Response) => {
  try {
    const providers = await prisma.user.findMany({
      where: { role: 'provider' },
      select: {
        ...safeUserSelect,
        category: true,
        receivedReviews: { select: { rating: true } },
      },
    });

    const allServiceIds = Array.from(
      new Set(providers.flatMap((p) => p.serviceIds || []))
    );

    const categoryServices = allServiceIds.length > 0
      ? await prisma.categoryService.findMany({
          where: { id: { in: allServiceIds } },
        })
      : [];

    const serviceMap = new Map(
      categoryServices.map((cs) => [
        cs.id,
        { id: cs.id, title: cs.title, categoryId: cs.categoryId },
      ])
    );

    const providersWithServices = providers.map((provider) => {
      const services = (provider.serviceIds || [])
        .map((id) => serviceMap.get(id))
        .filter(Boolean);
      
      // Calculate average rating and review count
      const reviewCount = provider.receivedReviews.length;
      let averageRating = 0;
      if (reviewCount > 0) {
        const totalRating = provider.receivedReviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = Math.round((totalRating / reviewCount) * 10) / 10; // Round to 1 decimal place
      }

      return {
        ...provider,
        services,
        averageRating,
        reviewCount,
      };
    });

    return res.status(200).json({
      status: 200,
      data: providersWithServices,
    });
  } catch (error) {
    console.error('GetExploreProviders error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving providers.',
    });
  }
};

/**
 * Search providers by name or username
 * @route GET /api/explore/search
 */
export const searchProviders = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const searchQuery = (q as string) || '';
    
    const providers = await prisma.user.findMany({
      where: {
        role: 'provider',
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { username: { contains: searchQuery, mode: 'insensitive' } }
        ]
      },
      select: safeUserSelect,
      take: 20
    });

    return res.status(200).json({
      status: 200,
      data: providers,
    });
  } catch (error) {
    console.error('SearchProviders error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error searching providers.',
    });
  }
};

/**
 * Get popular services across all categories
 * @route GET /api/explore/categories/popular-services
 */
export const getPopularServices = async (req: Request, res: Response) => {
  try {
    // For now, return first 5 services with their category data
    const services = await prisma.categoryService.findMany({
      include: { category: true },
      take: 5,
    });
    return res.status(200).json({
      status: 200,
      data: services,
    });
  } catch (error) {
    console.error('GetPopularServices Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving popular services.',
    });
  }
};
