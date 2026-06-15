import { Request, Response } from 'express';
import prisma from '../config/db';

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
      include: { category: true },
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
      return {
        ...provider,
        services,
      };
    });

    return res.status(200).json({
      status: 200,
      data: providersWithServices,
    });
  } catch (error) {
    console.error('GetExploreProviders Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving providers.',
    });
  }
};
