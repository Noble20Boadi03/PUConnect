import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Get service requests for authenticated user (either as requester or provider)
 * @route GET /api/service-requests
 */
export const getServiceRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const requests = await prisma.serviceRequest.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { providerId: userId }
        ]
      },
      include: {
        requester: true,
        provider: true,
        post: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({
      status: 200,
      data: requests
    });
  } catch (error) {
    console.error('GetServiceRequests error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Get single service request by id
 * @route GET /api/service-requests/:id
 */
export const getServiceRequestById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: { requester: true, provider: true, post: true }
    });
    if (!request) {
      return res.status(404).json({
        status: 404,
        message: 'Request not found'
      });
    }
    // Check if user is part of this request
    if (request.requesterId !== userId && request.providerId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized'
      });
    }
    return res.status(200).json({
      status: 200,
      data: request
    });
  } catch (error) {
    console.error('GetServiceRequestById error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Create a new service request
 * @route POST /api/service-requests
 */
export const createServiceRequest = async (req: Request, res: Response) => {
  try {
    const requesterId = (req as any).user.id;
    const { providerId, postId, message } = req.body;

    const request = await prisma.serviceRequest.create({
      data: {
        requesterId,
        providerId,
        postId,
        message,
        status: 'pending'
      },
      include: { requester: true, provider: true, post: true }
    });
    return res.status(201).json({
      status: 201,
      message: 'Request created successfully',
      data: request
    });
  } catch (error) {
    console.error('CreateServiceRequest error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Update service request status
 * @route PUT /api/service-requests/:id
 */
export const updateServiceRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { status, message } = req.body;

    // Check if request exists and user is provider
    const request = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({
        status: 404,
        message: 'Request not found'
      });
    }
    if (request.providerId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized'
      });
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: { status, message },
      include: { requester: true, provider: true, post: true }
    });
    return res.status(200).json({
      status: 200,
      message: 'Request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('UpdateServiceRequest error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};