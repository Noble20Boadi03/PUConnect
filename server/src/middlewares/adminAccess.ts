import { Request, Response, NextFunction } from 'express';
import { AdminTier } from '@prisma/client';

export type AdminSection = 'dashboard' | 'moderation' | 'directory' | 'content';

const SECTION_ACCESS: Record<AdminTier, AdminSection[]> = {
  super_admin: ['dashboard', 'moderation', 'directory', 'content'],
  moderator: ['moderation', 'content'],
  support: ['directory', 'moderation'],
};

export const requireAdminSection = (section: AdminSection) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Not authorized: admin role required.' });
    }

    const tier: AdminTier = user.adminTier ?? AdminTier.super_admin;
    const allowed = SECTION_ACCESS[tier] ?? SECTION_ACCESS.super_admin;

    if (!allowed.includes(section)) {
      return res.status(403).json({
        status: 403,
        message: `Not authorized: your admin tier (${tier}) cannot access ${section}.`,
      });
    }

    return next();
  };
};
