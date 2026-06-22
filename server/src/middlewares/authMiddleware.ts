import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import prisma from '../config/db';

/**
 * Middleware to protect API routes and verify JWT tokens.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in Authorization header (format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token part
      token = req.headers.authorization.split(' ')[1];

      // Verify the JWT signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as JwtPayload;

      // Get user from DB (fallback for old tokens without role)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, status: true, adminTier: true }
      });

      if (!user) {
        return res.status(401).json({
          status: 401,
          message: 'Not authorized: user not found.',
        });
      }

      // Check if user is suspended or banned (shadowbanned users may still use the app)
      if (user.status === 'suspended' || user.status === 'banned') {
        return res.status(403).json({
          status: 403,
          message: 'Your account has been suspended. Contact support if you believe this is an error.',
        });
      }

      // Attach user to request object
      (req as any).user = { id: user.id, role: user.role, status: user.status, adminTier: user.adminTier };
      
      return next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error);
      return res.status(401).json({
        status: 401,
        message: 'Not authorized: token is invalid or has expired.',
      });
    }
  }

  // If no token was found
  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Not authorized: no token was provided in the headers.',
    });
  }
};

/**
 * Middleware to require admin role for API routes (must be used after protect).
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      status: 403,
      message: 'Not authorized: admin role required.',
    });
  }
  return next();
};
