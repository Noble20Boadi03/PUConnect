import { Request, Response } from 'express';
import prisma from '../config/db';
import { io } from '../index';
import type { ServiceRequestKind, ServiceRequestStatus } from '@prisma/client';
import { sendPushNotification } from '../services/pushService';
import { sendSystemMessage } from './chatController';

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

export async function notifyUser(
  userId: string,
  kind: 'message' | 'service' | 'request' | 'system',
  title: string,
  body: string,
  targetId?: string,
  targetScreen?: string,
  data?: any
) {
  const notification = await prisma.notification.create({
    data: { userId, kind, title, body, targetId, targetScreen, data } as any,
  });
  io.to(userId).emit('newNotification', notification);
  
  // Fire-and-forget push notification
  (async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushToken: true },
      });
      if (user?.pushToken) {
        await sendPushNotification(
          user.pushToken, 
          title, 
          body, 
          data
        );
      }
    } catch (error) {
      console.error('Error sending push notification from notifyUser:', error);
    }
  })();
  
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

    const request = await prisma.serviceRequest.create({
      data: {
        requesterId,
        providerId,
        postId,
        kind,
        message,
        status: 'pending',
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

    await notifyUser(
      notifyTargetId, 
      'request', 
      title, 
      body, 
      request.id, 
      `/service-request/${request.id}`,
      { type: 'request', serviceRequestId: request.id }
    );
    emitServiceRequestUpdate(request);

    // Send system message to both parties
    if (kind === 'service') {
      // Client requests provider
      await sendSystemMessage(
        requesterId,
        providerId,
        "📋 You officially requested this service.",
        "📋 You received an official service request.",
        postId
      );
    } else {
      // Provider responds to client
      await sendSystemMessage(
        providerId,
        requesterId,
        "📋 You submitted an official response.",
        "📋 The provider submitted an official response to your request.",
        postId
      );
    }

    return res.status(201).json({
      status: 201,
      message: 'Official engagement started',
      data: request
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
        if (!isRequester || (request.status !== 'active' && request.status !== 'pending')) {
          return res.status(400).json({ status: 400, message: 'Invalid transition' });
        }
        updateData = { status: 'cancelled' };
        notifyTargetId = request.providerId;
        notifyTitle = 'Official Request Cancelled';
        notifyBody = `The official service request for "${postTitle}" was cancelled.`;
        break;

      case 'withdraw':
        if (!isProvider || (request.status !== 'active' && request.status !== 'pending')) {
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
      await notifyUser(
        notifyTargetId, 
        'service', 
        notifyTitle, 
        notifyBody, 
        updatedRequest.id, 
        `/service-request/${updatedRequest.id}`,
        { type: 'service', serviceRequestId: updatedRequest.id }
      );
    }
    emitServiceRequestUpdate(updatedRequest);

    // Send system message
    switch (action) {
      case 'cancel':
        // Client cancels
        await sendSystemMessage(
          updatedRequest.requesterId,
          updatedRequest.providerId,
          "❌ You cancelled the service request.",
          "❌ The client cancelled the service request.",
          updatedRequest.postId || undefined
        );
        break;
      case 'withdraw':
        // Provider withdraws
        await sendSystemMessage(
          updatedRequest.providerId,
          updatedRequest.requesterId,
          "❌ You declined this request.",
          "❌ Your request was declined.",
          updatedRequest.postId || undefined
        );
        break;
      case 'request_completion':
        // Provider requests completion
        await sendSystemMessage(
          updatedRequest.providerId,
          updatedRequest.requesterId,
          "✅ You marked the service as complete. Awaiting confirmation.",
          "✅ The provider marked the service as complete. Please confirm or request more work.",
          updatedRequest.postId || undefined
        );
        break;
      case 'confirm_completion':
        // Client confirms completion
        await sendSystemMessage(
          updatedRequest.requesterId,
          updatedRequest.providerId,
          "🎉 You confirmed the service as complete!",
          "🎉 The client confirmed the service is complete. You can request a review.",
          updatedRequest.postId || undefined
        );
        break;
      case 'decline_completion':
        // Client declines completion
        await sendSystemMessage(
          updatedRequest.requesterId,
          updatedRequest.providerId,
          "🔄 You requested more work on this service.",
          "🔄 The client requested more work. Service is still active.",
          updatedRequest.postId || undefined
        );
        break;
    }

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
 * Accept a pending service request (provider only)
 * @route PATCH /api/service-requests/:id/accept
 */
export const acceptServiceRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: includeRelations(),
    });
    if (!request) {
      return res.status(404).json({ status: 404, message: 'Request not found' });
    }
    if (request.providerId !== userId) {
      return res.status(403).json({ status: 403, message: 'Unauthorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ status: 400, message: 'Request is not pending' });
    }

    const now = new Date();
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: { status: 'active', acceptedAt: now },
      include: includeRelations(),
    });

    const postTitle = updatedRequest.post?.title ?? 'this listing';
    await notifyUser(
      updatedRequest.requesterId, 
      'request', 
      'Request Accepted', 
      `Your request for "${postTitle}" was accepted!`, 
      updatedRequest.id, 
      `/service-request/${updatedRequest.id}`,
      { type: 'request', serviceRequestId: updatedRequest.id }
    );
    emitServiceRequestUpdate(updatedRequest);

    await sendSystemMessage(
      updatedRequest.providerId,
      updatedRequest.requesterId,
      "✅ You accepted the service request.",
      "✅ Your service request was accepted!",
      updatedRequest.postId || undefined
    );

    return res.status(200).json({
      status: 200,
      message: 'Request accepted',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('AcceptServiceRequest error:', error);
    return res.status(500).json({ status: 500, message: 'Server error' });
  }
};

/**
 * Decline a pending service request (provider only)
 * @route PATCH /api/service-requests/:id/decline
 */
export const declineServiceRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: includeRelations(),
    });
    if (!request) {
      return res.status(404).json({ status: 404, message: 'Request not found' });
    }
    if (request.providerId !== userId) {
      return res.status(403).json({ status: 403, message: 'Unauthorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ status: 400, message: 'Request is not pending' });
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: { status: 'declined' },
      include: includeRelations(),
    });

    const postTitle = updatedRequest.post?.title ?? 'this listing';
    await notifyUser(
      updatedRequest.requesterId, 
      'request', 
      'Request Declined', 
      `Your request for "${postTitle}" was declined.`, 
      updatedRequest.id, 
      `/service-request/${updatedRequest.id}`,
      { type: 'request', serviceRequestId: updatedRequest.id }
    );
    emitServiceRequestUpdate(updatedRequest);

    await sendSystemMessage(
      updatedRequest.providerId,
      updatedRequest.requesterId,
      "❌ You declined the service request.",
      "❌ Your service request was declined.",
      updatedRequest.postId || undefined
    );

    return res.status(200).json({
      status: 200,
      message: 'Request declined',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('DeclineServiceRequest error:', error);
    return res.status(500).json({ status: 500, message: 'Server error' });
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
