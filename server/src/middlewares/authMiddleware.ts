import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

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

      // Attach decoded user payload to request object
      (req as any).user = { id: decoded.id };
      
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
