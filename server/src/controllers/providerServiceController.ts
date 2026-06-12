import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Get all provider services (or filter by user)
 * @route GET /api/provider-services
 */
export const getProviderServices = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const services = await prisma.providerService.findMany({
      where: userId ? { userId: userId as string } : {},
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({
      status: 200,
      data: services
    });
  } catch (error) {
    console.error('GetProviderServices error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Get single provider service by id
 * @route GET /api/provider-services/:id
 */
export const getProviderServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await prisma.providerService.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!service) {
      return res.status(404).json({
        status: 404,
        message: 'Service not found'
      });
    }
    return res.status(200).json({
      status: 200,
      data: service
    });
  } catch (error) {
    console.error('GetProviderServiceById error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Create a new provider service
 * @route POST /api/provider-services
 */
export const createProviderService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { categoryId, title, description, price, tags } = req.body;

    const service = await prisma.providerService.create({
      data: {
        userId,
        categoryId,
        title,
        description,
        price,
        tags
      },
      include: { user: true }
    });
    return res.status(201).json({
      status: 201,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('CreateProviderService error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Update a provider service
 * @route PUT /api/provider-services/:id
 */
export const updateProviderService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { categoryId, title, description, price, tags } = req.body;

    // Check if service exists and belongs to user
    const service = await prisma.providerService.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({
        status: 404,
        message: 'Service not found'
      });
    }
    if (service.userId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized'
      });
    }

    const updatedService = await prisma.providerService.update({
      where: { id },
      data: { categoryId, title, description, price, tags },
      include: { user: true }
    });
    return res.status(200).json({
      status: 200,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('UpdateProviderService error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Delete a provider service
 * @route DELETE /api/provider-services/:id
 */
export const deleteProviderService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if service exists and belongs to user
    const service = await prisma.providerService.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({
        status: 404,
        message: 'Service not found'
      });
    }
    if (service.userId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized'
      });
    }

    await prisma.providerService.delete({ where: { id } });
    return res.status(200).json({
      status: 200,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('DeleteProviderService error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};