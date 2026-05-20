import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

const VALID_THEME_PREFERENCES = ['light', 'dark'] as const;

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
  themePreference: string;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  username: user.username,
  role: user.role,
  avatarUrl: user.avatarUrl,
  themePreference: user.themePreference,
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
 * Update authenticated user preferences.
 * @route PATCH /api/auth/preferences
 */
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { themePreference } = req.body;

    if (!themePreference || !VALID_THEME_PREFERENCES.includes(themePreference)) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide a valid themePreference ("light" or "dark").',
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { themePreference },
    });

    return res.status(200).json({
      status: 200,
      message: 'Preferences updated successfully.',
      data: {
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    console.error('UpdatePreferences Error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error updating preferences. Please try again.',
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
