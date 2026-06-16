import { Request, Response } from 'express';
import prisma from '../config/db';
import { io } from '../index';
import type { ServiceRequestKind, ServiceRequestStatus } from '@prisma/client';

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

const ACTIVE_STATUSES: ServiceRequestStatus[] = ['active', 'pending_review', 'pending'];

function includeRelations() {
  return {
    requester: {
      select: { id: true, name: true, username: true, avatarUrl: true },
    },
    provider: {
      select: { id: true, name: true, username: true, avatarUrl: true },
    },
    post: { select: postSelect },
  };
}

function emitServiceRequestUpdate(request: Awaited<ReturnType<typeof prisma.serviceRequest.findUnique>>) {
  if (!request) return;
  io.to(request.requesterId).emit('serviceRequestUpdated', request);
  io.to(request.providerId).emit('serviceRequestUpdated', request);
}

async function notifyUser(
  userId: string,
  kind: 'request' | 'service',
  title: string,
  body: string
) {
  const notification = await prisma.notification.create({
    data: { userId, kind, title, body },
  });
  io.to(userId).emit('newNotification', notification);
  return notification;
}

/**
 * Get service requests for authenticated user (either as requester or provider)
 * @route GET /api/service-requests
 */
export const getServiceRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const requests = await prisma.serviceRequest.findMany({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
      },
      include: includeRelations(),
      orderBy: { updatedAt: 'desc' },
    });
    return res.status(200).json({
      status: 200,
      data: requests,
    });
  } catch (error) {
    console.error('GetServiceRequests error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
    });
  }
};

/**
 * Get service request for a chat context (post + peer)
 * @route GET /api/service-requests/chat
 */
export const getServiceRequestForChat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId, peerUsername } = req.query;

    if (typeof postId !== 'string' || typeof peerUsername !== 'string') {
      return res.status(400).json({
        status: 400,
        message: 'postId and peerUsername are required',
      });
    }

    const peer = await prisma.user.findUnique({ where: { username: peerUsername }, select: { id: true, name: true, username: true, avatarUrl: true } });
    if (!peer) {
      return res.status(404).json({
        status: 404,
        message: 'Peer not found',
      });
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        postId,
        OR: [
          { requesterId: userId, providerId: peer.id },
          { requesterId: peer.id, providerId: userId },
        ],
        status: { notIn: ['cancelled', 'declined'] },
      },
      include: includeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 200,
      data: request,
    });
  } catch (error) {
    console.error('GetServiceRequestForChat error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
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
      include: includeRelations(),
    });
    if (!request) {
      return res.status(404).json({
        status: 404,
        message: 'Request not found',
      });
    }
    if (request.requesterId !== userId && request.providerId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized',
      });
    }
    return res.status(200).json({
      status: 200,
      data: request,
    });
  } catch (error) {
    console.error('GetServiceRequestById error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
    });
  }
};

/**
 * Create an official service request or response
 * @route POST /api/service-requests
 */
export const createServiceRequest = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id;
    const { postId, message } = req.body;

    if (!postId) {
      return res.status(400).json({
        status: 400,
        message: 'postId is required',
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: safeUserSelect } },
    });
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found',
      });
    }

    const isServicePost = post.tag === 'Service';
    const isRequestPost = post.tag === 'Request';

    if (!isServicePost && !isRequestPost) {
      return res.status(400).json({
        status: 400,
        message: 'Post must be a Service or Request listing',
      });
    }

    let requesterId: string;
    let providerId: string;
    let kind: ServiceRequestKind;

    if (isServicePost) {
      if (post.authorId === currentUserId) {
        return res.status(400).json({
          status: 400,
          message: 'You cannot request your own service listing',
        });
      }
      requesterId = currentUserId;
      providerId = post.authorId;
      kind = 'service';
    } else {
      if (post.authorId === currentUserId) {
        return res.status(400).json({
          status: 400,
          message: 'You cannot respond to your own request listing',
        });
      }
      requesterId = post.authorId;
      providerId = currentUserId;
      kind = 'response';
    }

    const existing = await prisma.serviceRequest.findFirst({
      where: {
        postId,
        requesterId,
        providerId,
        status: { in: ['active', 'pending_review', 'pending'] },
      },
    });
    if (existing) {
      return res.status(409).json({
        status: 409,
        message: 'An active official engagement already exists for this listing',
        data: existing,
      });
    }

    const now = new Date();
    const request = await prisma.serviceRequest.create({
      data: {
        requesterId,
        providerId,
        postId,
        kind,
        message,
        status: 'active',
        acceptedAt: now,
      },
      include: includeRelations(),
    });

    const initiator = await prisma.user.findUnique({ where: { id: currentUserId }, select: { id: true, name: true, username: true, avatarUrl: true } });
    const notifyTargetId = currentUserId === requesterId ? providerId : requesterId;
    const title =
      kind === 'service' ? 'New Official Service Request' : 'New Official Response';
    const body =
      kind === 'service'
        ? `${initiator?.name ?? 'Someone'} started an official service request for "${post.title}".`
        : `${initiator?.name ?? 'Someone'} submitted an official response to your request "${post.title}".`;

    await notifyUser(notifyTargetId, 'request', title, body);
    emitServiceRequestUpdate(request);

    return res.status(201).json({
      status: 201,
      message: 'Official engagement started',
      data: request,
    });
  } catch (error) {
    console.error('CreateServiceRequest error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
    });
  }
};

type TransitionAction =
  | 'cancel'
  | 'withdraw'
  | 'request_completion'
  | 'confirm_completion'
  | 'decline_completion';

/**
 * Transition a service request through the official lifecycle
 * @route PATCH /api/service-requests/:id/transition
 */
export const transitionServiceRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { action } = req.body as { action?: TransitionAction };

    if (!action) {
      return res.status(400).json({
        status: 400,
        message: 'action is required',
      });
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: includeRelations(),
    });
    if (!request) {
      return res.status(404).json({
        status: 404,
        message: 'Request not found',
      });
    }

    const isRequester = request.requesterId === userId;
    const isProvider = request.providerId === userId;
    if (!isRequester && !isProvider) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized',
      });
    }

    const now = new Date();
    let updateData: {
      status: ServiceRequestStatus;
      completionRequestedAt?: Date | null;
      completedAt?: Date | null;
    } | null = null;
    let notifyTargetId: string | null = null;
    let notifyTitle = '';
    let notifyBody = '';

    const postTitle = request.post?.title ?? 'this listing';

    switch (action) {
      case 'cancel':
        if (!isRequester || request.status !== 'active') {
          return res.status(400).json({ status: 400, message: 'Invalid transition' });
        }
        updateData = { status: 'cancelled' };
        notifyTargetId = request.providerId;
        notifyTitle = 'Official Request Cancelled';
        notifyBody = `The official service request for "${postTitle}" was cancelled.`;
        break;

      case 'withdraw':
        if (!isProvider || request.status !== 'active') {
          return res.status(400).json({ status: 400, message: 'Invalid transition' });
        }
        updateData = { status: 'cancelled' };
        notifyTargetId = request.requesterId;
        notifyTitle = 'Official Response Withdrawn';
        notifyBody = `The official response for "${postTitle}" was withdrawn.`;
        break;

      case 'request_completion':
        if (!isProvider || request.status !== 'active') {
          return res.status(400).json({ status: 400, message: 'Invalid transition' });
        }
        updateData = { status: 'pending_review', completionRequestedAt: now };
        notifyTargetId = request.requesterId;
        notifyTitle = 'Completion Requested';
        notifyBody = `Please review and confirm completion for "${postTitle}".`;
        break;

      case 'confirm_completion':
        if (!isRequester || request.status !== 'pending_review') {
          return res.status(400).json({ status: 400, message: 'Invalid transition' });
        }
        updateData = { status: 'completed', completedAt: now };
        notifyTargetId = request.providerId;
        notifyTitle = 'Service Completed';
        notifyBody = `The client confirmed completion for "${postTitle}".`;
        break;

      case 'decline_completion':
        if (!isRequester || request.status !== 'pending_review') {
          return res.status(400).json({ status: 400, message: 'Invalid transition' });
        }
        updateData = { status: 'active', completionRequestedAt: null };
        notifyTargetId = request.providerId;
        notifyTitle = 'Completion Declined';
        notifyBody = `The client declined completion for "${postTitle}" — more work is needed.`;
        break;

      default:
        return res.status(400).json({ status: 400, message: 'Unknown action' });
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
      include: includeRelations(),
    });

    if (notifyTargetId) {
      await notifyUser(notifyTargetId, 'service', notifyTitle, notifyBody);
    }
    emitServiceRequestUpdate(updatedRequest);

    return res.status(200).json({
      status: 200,
      message: 'Request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('TransitionServiceRequest error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error',
    });
  }
};

/**
 * @deprecated Use transitionServiceRequest instead
 * @route PUT /api/service-requests/:id
 */
export const updateServiceRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { status } = req.body;

    const request = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ status: 404, message: 'Request not found' });
    }
    if (request.providerId !== userId) {
      return res.status(403).json({ status: 403, message: 'Unauthorized' });
    }

    const mappedStatus =
      status === 'accepted'
        ? 'active'
        : status === 'declined'
          ? 'declined'
          : (status as ServiceRequestStatus);

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: { status: mappedStatus },
      include: includeRelations(),
    });

    emitServiceRequestUpdate(updatedRequest);

    return res.status(200).json({
      status: 200,
      message: 'Request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('UpdateServiceRequest error:', error);
    return res.status(500).json({ status: 500, message: 'Server error' });
  }
};
