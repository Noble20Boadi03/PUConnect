export type UserRole = 'student' | 'admin';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';
export type ListingType = 'service_offer' | 'service_request' | 'project_team' | 'product';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string; // Unified: replaced universityId in UI
  universityId?: string; // Kept for backend compatibility
  role: UserRole;
  isActive: boolean;

  // Profile fields
  bio?: string;
  skillTags?: string[];
  experienceLevel?: ExperienceLevel;
  portfolioLinks?: string[];
  isAvailable?: boolean;
  profilePictureUrl?: string;
  
  // Provider / Professional Fields
  category?: string;
  subcategory?: string;
  department?: string;
  graduationYear?: number;

  // Reputation & Marketplace
  reputationScore?: number; // 0-100 or rating-based
  completedProjects?: number;
  review_count?: number;
  verifiedStudent?: boolean;

  /** After provider upgrade (skills + trust fields). Required to publish service_offer listings. */
  canOfferServices?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price?: number; // Primary for service_offer
  budget?: number; // Primary for service_request
  priceType: 'fixed' | 'negotiable' | 'starting_at';
  category: string;
  subcategory?: string;
  type: ListingType;
  ownerId: string;
  isActive: boolean;

  // Media
  media_url?: string; // Legacy/Single
  media_urls: string[]; // Unified: always use array in UI
  
  // Marketplace details
  urgency?: string;
  deadline?: string;
  requiredSkills?: string[];
  teamSize?: number; // For project teams
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
  peerId?: string; // Unified: for thread grouping
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
