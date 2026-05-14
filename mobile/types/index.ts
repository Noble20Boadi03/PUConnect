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
  review_count?: number;
  verifiedStudent?: boolean;
  department?: string;
  graduationYear?: number;

  /** After provider upgrade (skills + trust fields). Required to publish service_offer listings. */
  canOfferServices?: boolean;

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
  priceType?: 'fixed' | 'negotiable' | 'starting_at';
  urgency?: string;
  deadline?: string;
  requiredSkills?: string[];
  teamSize?: number; // For project teams
  media_url?: string;
  media_urls?: string[];
  subcategory?: string;
  level?: string;
  department?: string;
  tags?: string[];
  average_rating?: number;
  review_count?: number;

  ownerName?: string;
  ownerAvatar?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  listingTitle?: string;
  listingThumbnail?: string;
  message: string;
  isRead: boolean;
  senderName?: string;
  senderAvatar?: string;
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

/** Negotiation state between two users for a listing thread (mock API). */
export type ConversationLifecycle = 'open' | 'hired' | 'completed';

export interface Review {
  id: string;
  listingId: string;
  authorUserId: string;
  targetUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SubcategoryFilter {
  id: string;
  subcategory: string;
  filter_label: string;
  filter_type: 'dropdown' | 'multi_select' | 'range' | 'radio' | string;
  filter_options: any;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
