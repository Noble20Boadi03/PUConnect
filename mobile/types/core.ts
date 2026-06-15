import type { PostPrice, MarketPostTag } from './market';
import type { ExploreCategoryId } from './explore';

export type DbNotificationKind = 'message' | 'service' | 'request' | 'system';

export interface DbNotification {
  id: string;
  userId: string;
  kind: DbNotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface DbCategory {
  id: ExploreCategoryId;
  title: string;
  pillLabel: string;
  tagline: string;
  description: string;
  imageUrl: string;
  accentColor: string;
  iconName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbCategoryService {
  id: string;
  categoryId: ExploreCategoryId;
  title: string;
  description: string;
  filterTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DbPost {
  id: string;
  title: string;
  description: string;
  tag: MarketPostTag;
  price: PostPrice;
  images: string[];
  hashtags: string[];
  helpCategoryIds: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    bio?: string;
  };
}

export interface DbProviderService {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  price: PostPrice;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    bio: string;
  };
}

export type DbServiceRequestStatus =
  | 'pending'
  | 'active'
  | 'pending_review'
  | 'completed'
  | 'cancelled'
  | 'declined';

export type DbServiceRequestKind = 'service' | 'response';

export interface DbServiceRequest {
  id: string;
  requesterId: string;
  providerId: string;
  postId: string | null;
  kind: DbServiceRequestKind;
  status: DbServiceRequestStatus;
  message: string | null;
  acceptedAt: string | null;
  completionRequestedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  provider?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  post?: DbPost;
}

export interface DbReview {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  serviceTitle: string | null;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  reviewee?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
}
