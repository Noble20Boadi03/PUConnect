import { Request, Response } from 'express';
import { MessageKind, NotificationKind, Prisma, ServiceRequestStatus } from '@prisma/client';
import prisma from '../config/db';

const safeUserSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  status: true,
  role: true,
};

const getAdminTier = (req: Request) => (req as any).user?.adminTier ?? 'super_admin';

const canModerateUsers = (tier: string) => tier === 'super_admin' || tier === 'moderator';
const canBanUsers = (tier: string) => tier === 'super_admin' || tier === 'moderator';

/**
 * Command center summary for admin dashboard
 * @route GET /admin/dashboard
 */
export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const [
      pendingReports,
      pendingProviders,
      pendingDisputes,
      openFeedback,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { providerApprovalStatus: 'pending' } }),
      prisma.serviceRequest.count({ where: { status: 'pending_review' } }),
      prisma.feedback.count({ where: { status: 'open' } }),
      prisma.adminActionLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, username: true, name: true } } },
      }),
    ]);

    return res.status(200).json({
      status: 200,
      data: {
        pendingReports,
        pendingProviders,
        pendingDisputes,
        openFeedback,
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error('GetDashboard error:', error);
    return res.status(500).json({ status: 500, message: 'Server error retrieving dashboard.' });
  }
};

/**
 * Rapid triage action on a report
 * @route POST /admin/reports/:id/triage
 */
export const triageReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const adminId = (req as any).user.id;
    const tier = getAdminTier(req);

    if (!['dismiss', 'remove_content', 'suspend_user'].includes(action)) {
      return res.status(400).json({ status: 400, message: 'Invalid triage action.' });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ status: 404, message: 'Report not found.' });
    }

    if (action === 'suspend_user' && !canBanUsers(tier)) {
      return res.status(403).json({ status: 403, message: 'Your admin tier cannot suspend users.' });
    }

    if (action === 'dismiss') {
      await prisma.report.update({
        where: { id },
        data: { status: 'dismissed', reviewedAt: new Date(), reviewedBy: adminId },
      });
    } else if (action === 'remove_content' && report.targetType === 'post') {
      await prisma.post.update({
        where: { id: report.targetId },
        data: { status: 'removed_by_admin' },
      });
      await prisma.report.update({
        where: { id },
        data: { status: 'actioned', reviewedAt: new Date(), reviewedBy: adminId },
      });
    } else if (action === 'suspend_user' && report.targetType === 'user') {
      await prisma.user.update({
        where: { id: report.targetId },
        data: { status: 'suspended' },
      });
      await prisma.report.update({
        where: { id },
        data: { status: 'actioned', reviewedAt: new Date(), reviewedBy: adminId },
      });
    } else {
      return res.status(400).json({ status: 400, message: 'Action not applicable to this report target.' });
    }

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'report_triage',
        targetType: 'report',
        targetId: id,
        toValue: action,
        reason: `Triage: ${action} on ${report.targetType} ${report.targetId}`,
      },
    });

    return res.status(200).json({ status: 200, message: 'Triage action completed.' });
  } catch (error) {
    console.error('TriageReport error:', error);
    return res.status(500).json({ status: 500, message: 'Server error processing triage.' });
  }
};

/**
 * Provider approval queue
 * @route GET /admin/providers/pending
 */
export const getPendingProviders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = { providerApprovalStatus: 'pending' as const };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
          categoryId: true,
          skillTitle: true,
          expertiseTags: true,
          serviceIds: true,
          providerAppliedAt: true,
          createdAt: true,
        },
        orderBy: { providerAppliedAt: 'asc' },
        take: limitNum,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      status: 200,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('GetPendingProviders error:', error);
    return res.status(500).json({ status: 500, message: 'Server error retrieving provider queue.' });
  }
};

/**
 * Approve or reject a provider application
 * @route PATCH /admin/providers/:id/review
 */
export const reviewProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, note } = req.body;
    const adminId = (req as any).user.id;

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ status: 400, message: 'Decision must be approve or reject.' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.providerApprovalStatus !== 'pending') {
      return res.status(404).json({ status: 404, message: 'Pending provider application not found.' });
    }

    const isApproved = decision === 'approve';

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: isApproved ? 'provider' : user.role,
        providerApprovalStatus: isApproved ? 'approved' : 'rejected',
        providerReviewedAt: new Date(),
        providerReviewNote: note ?? null,
      },
      select: safeUserSelect,
    });

    await prisma.notification.create({
      data: {
        userId: id,
        kind: NotificationKind.system,
        title: isApproved ? 'Provider application approved ✅' : 'Provider application update',
        body: isApproved
          ? 'Welcome aboard! Your provider profile is now live on PUConnect.'
          : note ?? 'Your provider application was not approved at this time. You may update your profile and reapply.',
        read: false,
        data: { type: 'system', providerReview: decision },
      },
    });

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: isApproved ? 'provider_approved' : 'provider_rejected',
        targetType: 'user',
        targetId: id,
        toValue: decision,
        reason: note ?? undefined,
      },
    });

    return res.status(200).json({ status: 200, message: `Provider ${decision}d.`, data: updated });
  } catch (error) {
    console.error('ReviewProvider error:', error);
    return res.status(500).json({ status: 500, message: 'Server error reviewing provider.' });
  }
};

/**
 * Send an official warning to a user (system message in their inbox)
 * @route POST /admin/users/:id/warn
 */
export const warnUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const adminId = (req as any).user.id;

    if (!message?.trim()) {
      return res.status(400).json({ status: 400, message: 'Warning message is required.' });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ status: 404, message: 'User not found.' });
    }

    if (target.role === 'admin') {
      return res.status(403).json({ status: 403, message: 'Cannot warn an admin account.' });
    }

    const warningText = `⚠️ Official Warning from PUConnect:\n\n${message.trim()}`;

    await prisma.chatMessage.create({
      data: {
        senderId: adminId,
        receiverId: id,
        content: warningText,
        kind: MessageKind.system,
        isRead: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: id,
        kind: NotificationKind.system,
        title: 'Official Warning from PUConnect',
        body: message.trim().slice(0, 120),
        read: false,
        data: { type: 'system', warning: true },
      },
    });

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'user_warned',
        targetType: 'user',
        targetId: id,
        reason: message.trim(),
      },
    });

    return res.status(200).json({ status: 200, message: 'Warning sent to user.' });
  } catch (error) {
    console.error('WarnUser error:', error);
    return res.status(500).json({ status: 500, message: 'Server error sending warning.' });
  }
};

/**
 * Bulk update post statuses
 * @route PATCH /admin/posts/bulk-status
 */
export const bulkUpdatePostStatus = async (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body;
    const adminId = (req as any).user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: 'ids array is required.' });
    }

    const validStatuses = ['active', 'hidden_by_owner', 'locked_by_admin', 'removed_by_admin'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 400, message: 'Invalid post status.' });
    }

    const result = await prisma.post.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'posts_bulk_status',
        targetType: 'post',
        targetId: ids.join(','),
        toValue: status,
        reason: `Bulk updated ${result.count} posts`,
      },
    });

    return res.status(200).json({ status: 200, message: `Updated ${result.count} posts.`, data: { count: result.count } });
  } catch (error) {
    console.error('BulkUpdatePostStatus error:', error);
    return res.status(500).json({ status: 500, message: 'Server error bulk updating posts.' });
  }
};

/**
 * Update post images (admin moderation edit)
 * @route PATCH /admin/posts/:id/images
 */
export const updatePostImages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { images } = req.body;
    const adminId = (req as any).user.id;

    if (!Array.isArray(images)) {
      return res.status(400).json({ status: 400, message: 'images array is required.' });
    }

    const post = await prisma.post.update({
      where: { id },
      data: { images },
      select: { id: true, title: true, images: true, status: true },
    });

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'post_images_edited',
        targetType: 'post',
        targetId: id,
        reason: `Admin edited images (${images.length} remaining)`,
      },
    });

    return res.status(200).json({ status: 200, data: post });
  } catch (error) {
    console.error('UpdatePostImages error:', error);
    return res.status(500).json({ status: 500, message: 'Server error updating post images.' });
  }
};

/**
 * Service request disputes (pending_review queue)
 * @route GET /admin/disputes
 */
export const getDisputes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ServiceRequestWhereInput = {};
    if (status && status !== 'all') {
      // Validate status is a valid ServiceRequestStatus enum value
      const validStatuses = Object.values(ServiceRequestStatus);
      if (validStatuses.includes(status as ServiceRequestStatus)) {
        where.status = status as ServiceRequestStatus;
      } else {
        // Invalid status, fall back to default
        where.status = ServiceRequestStatus.pending_review;
      }
    } else {
      where.status = ServiceRequestStatus.pending_review;
    }

    const [disputes, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          requester: { select: safeUserSelect },
          provider: { select: safeUserSelect },
          post: { select: { id: true, title: true, tag: true } },
        },
        orderBy: { completionRequestedAt: 'asc' },
        take: limitNum,
        skip,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return res.status(200).json({
      status: 200,
      data: disputes,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('GetDisputes error:', error);
    return res.status(500).json({ status: 500, message: 'Server error retrieving disputes.' });
  }
};

/**
 * Dispute detail with chat context
 * @route GET /admin/disputes/:id
 */
export const getDisputeDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dispute = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        requester: { select: safeUserSelect },
        provider: { select: safeUserSelect },
        post: true,
        reviews: true,
      },
    });

    if (!dispute) {
      return res.status(404).json({ status: 404, message: 'Service request not found.' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: dispute.requesterId, receiverId: dispute.providerId },
          { senderId: dispute.providerId, receiverId: dispute.requesterId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: safeUserSelect },
        receiver: { select: safeUserSelect },
      },
    });

    return res.status(200).json({ status: 200, data: { ...dispute, messages } });
  } catch (error) {
    console.error('GetDisputeDetail error:', error);
    return res.status(500).json({ status: 500, message: 'Server error retrieving dispute detail.' });
  }
};

/**
 * Admin resolves a service dispute
 * @route PATCH /admin/disputes/:id/resolve
 */
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution, note } = req.body;
    const adminId = (req as any).user.id;

    if (!['complete', 'cancel', 'resume'].includes(resolution)) {
      return res.status(400).json({ status: 400, message: 'Invalid resolution.' });
    }

    const sr = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!sr) {
      return res.status(404).json({ status: 404, message: 'Service request not found.' });
    }

    const statusMap = { complete: 'completed', cancel: 'cancelled', resume: 'active' } as const;
    const newStatus = statusMap[resolution as keyof typeof statusMap];

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: resolution === 'complete' ? new Date() : sr.completedAt,
        completionRequestedAt: resolution === 'resume' ? null : sr.completionRequestedAt,
      },
    });

    const notifyIds = [sr.requesterId, sr.providerId];
    await prisma.notification.createMany({
      data: notifyIds.map((userId) => ({
        userId,
        kind: NotificationKind.system,
        title: 'Service dispute resolved',
        body: note ?? `An admin has resolved your service request (${resolution}).`,
        read: false,
        data: { type: 'system', serviceRequestId: id, adminResolution: resolution },
      })),
    });

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'dispute_resolved',
        targetType: 'service_request',
        targetId: id,
        toValue: resolution,
        reason: note ?? undefined,
      },
    });

    return res.status(200).json({ status: 200, message: 'Dispute resolved.', data: updated });
  } catch (error) {
    console.error('ResolveDispute error:', error);
    return res.status(500).json({ status: 500, message: 'Server error resolving dispute.' });
  }
};

/**
 * Admin feedback inbox
 * @route GET /admin/feedback
 */
export const getFeedback = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: { user: { select: safeUserSelect } },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      }),
      prisma.feedback.count({ where }),
    ]);

    return res.status(200).json({
      status: 200,
      data: items,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('GetFeedback error:', error);
    return res.status(500).json({ status: 500, message: 'Server error retrieving feedback.' });
  }
};

/**
 * Update feedback status
 * @route PATCH /admin/feedback/:id
 */
export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ status: 400, message: 'Status must be open or closed.' });
    }

    const updated = await prisma.feedback.update({ where: { id }, data: { status } });
    return res.status(200).json({ status: 200, data: updated });
  } catch (error) {
    console.error('UpdateFeedbackStatus error:', error);
    return res.status(500).json({ status: 500, message: 'Server error updating feedback.' });
  }
};
