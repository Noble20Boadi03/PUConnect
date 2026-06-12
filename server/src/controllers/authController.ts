import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { emailService } from '../services/emailService';

/**
 * Maps a database user to the public API user shape.
 */
const toPublicUser = (user: {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatarUrl: string;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  username: user.username,
  role: user.role,
  avatarUrl: user.avatarUrl,
});

/**
 * Helper: Generate JWT session token for a given user ID.
 */
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as any });
};

/**
 * Register a new user.
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, username, password } = req.body;

    // 1. Validate request body
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide name, email, username, and password.',
      });
    }

    // 2. Check if email is already registered in Supabase
    const emailExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (emailExists) {
      return res.status(400).json({
        status: 400,
        message: 'An account with this email address already exists.',
      });
    }

    // 3. Check if username is already taken
    const usernameExists = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (usernameExists) {
      return res.status(400).json({
        status: 400,
        message: 'This username is already taken.',
      });
    }

    // 4. Manual Password Hashing for Prisma (since Prisma lacks Schema pre-save hooks)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = (await bcrypt.hash(password, salt)) as string;

    // 5. Create new user in PostgreSQL Supabase database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
      },
    });

    // 6. Generate session token
    const token = generateToken(user.id);

    // 7. Return response containing user and token
    return res.status(201).json({
      status: 201,
      message: 'User registered successfully.',
      data: {
        token,
        user: toPublicUser(user),
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error during registration. Please try again.',
    });
  }
};

/**
 * Authenticate user & return token.
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, email, password } = req.body;
    const identifier = emailOrUsername || email;

    // 1. Validate inputs
    if (!identifier || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide both email/username and password.',
      });
    }

    // 2. Find user in PostgreSQL Supabase database by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      },
    });
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials. Please try again.',
      });
    }

    // 3. Compare passwords explicitly using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password) as boolean;
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid email or password credentials.',
      });
    }

    // 4. Generate token
    const token = generateToken(user.id);

    // 5. Return response containing user and token
    return res.status(200).json({
      status: 200,
      message: 'Login successful.',
      data: {
        token,
        user: toPublicUser(user),
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error during authentication. Please try again.',
    });
  }
};

/**
 * Get current authenticated user profile.
 * @route GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // req.user is set by authMiddleware
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      status: 200,
      data: toPublicUser(user),
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error retrieving profile details.',
    });
  }
};


/**
 * Log out user (for custom manual auth, we verify/clear client tokens).
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  return res.status(200).json({
    status: 200,
    message: 'Logged out successfully.',
  });
};

/**
 * Delete authenticated user's account permanently.
 * @route DELETE /api/auth/delete-account
 */
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      status: 200,
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    console.error('DeleteAccount Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error deleting account. Please try again.',
    });
  }
};

/**
 * Revoke provider status for authenticated user.
 * @route PATCH /api/auth/revoke-provider
 */
export const revokeProviderStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'user' },
    });

    return res.status(200).json({
      status: 200,
      message: 'Provider status revoked successfully.',
    });
  } catch (error) {
    console.error('RevokeProvider Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error revoking provider status. Please try again.',
    });
  }
};

/**
 * Generate a random 6-digit OTP code
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send password reset OTP to user's email.
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername } = req.body;
    if (!emailOrUsername) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide your email or username.',
      });
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      },
    });

    // Even if user doesn't exist, return success (security best practice)
    if (!user) {
      return res.status(200).json({
        status: 200,
        message: 'If an account exists with that email or username, a password reset OTP has been sent.',
      });
    }

    // Generate 6-digit OTP (expires in 10 minutes)
    const otpCode = generateOTP();

    // Save OTP and expiration to user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otpCode,
        otpExpires: new Date(Date.now() + 600000), // 10 minutes from now
      },
    });

    // Send OTP email
    await emailService.sendPasswordResetEmail(user.email, otpCode);

    return res.status(200).json({
      status: 200,
      message: 'If an account exists with that email or username, a password reset OTP has been sent.',
    });
  } catch (error) {
    console.error('ForgotPassword Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error processing password reset request. Please try again.',
    });
  }
};

/**
 * Verify if a password reset OTP is valid.
 * @route POST /api/auth/verify-otp
 */
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, otp } = req.body;
    if (!emailOrUsername || !otp) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide email/username and OTP.',
      });
    }

    // Find user by email or username and check OTP/expiry
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
        otpCode: otp,
        otpExpires: { gt: new Date() }, // OTP not expired
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid or expired OTP.',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'OTP is valid.',
    });
  } catch (error) {
    console.error('VerifyOTP Error:', error);
    return res.status(400).json({
      status: 400,
      message: 'Invalid or expired OTP.',
    });
  }
};

/**
 * Reset user password using valid OTP.
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, otp, newPassword, confirmPassword } = req.body;
    
    if (!emailOrUsername || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: 'Please fill in all fields.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: 'Passwords do not match.',
      });
    }
    
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
        otpCode: otp,
        otpExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid or expired OTP.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpires: null,
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('ResetPassword Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error resetting password. Please try again.',
    });
  }
};

/**
 * Change authenticated user's password
 * @route POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validate request body
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        status: 400,
        message: 'Please fill in all fields.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        status: 400,
        message: 'New passwords do not match.',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found.',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: 'Current password is incorrect.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear any reset tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpires: null,
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    console.error('ChangePassword Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error while changing password. Please try again.',
    });
  }
};
