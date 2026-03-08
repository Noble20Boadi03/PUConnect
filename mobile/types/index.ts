export type UserRole = 'student' | 'admin';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';
export type ListingType = 'service_offer' | 'service_request' | 'project_team' | 'product';

export interface User {
  id: string;
  email: string;
  fullName: string;
  universityId: string;
  role: UserRole;
  isActive: boolean;

  // Profile fields
  bio?: string;
  skillTags?: string[];
  experienceLevel?: ExperienceLevel;
  portfolioLinks?: string[];
  isAvailable?: boolean;
  profilePictureUrl?: string;

  // Reputation & Marketplace
  reputationScore?: number; // 0-100 or rating-based
  completedProjects?: number;
  verifiedStudent?: boolean;
  department?: string;
  graduationYear?: number;

  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price?: number; // Optional for projects/certain services
  budget?: number; // For service requests
  category: string;
  type: ListingType;
  ownerId: string;
  isActive: boolean;

  // Specific to marketplace focus
  deadline?: string;
  requiredSkills?: string[];
  teamSize?: number; // For project teams

  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse extends AuthTokens { }

export interface UserResponse extends User { }
