import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type MarketIconName = ComponentProps<typeof Ionicons>['name'];

export interface PopularService {
  id: string;
  title: string;
  icon: MarketIconName;
  accentColor: string;
}

export type PostPrice =
  | { kind: 'fixed'; amount: number }
  | { kind: 'range'; min: number; max: number }
  | { kind: 'negotiated' };

export type MarketPostTag = 'Service' | 'Request';

/** Market header filter pills — controls the vertical post feed. */
export type MarketFilter = 'all' | 'services' | 'requests';

interface MarketPostBase {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorInitials: string;
  price: PostPrice;
  postedAt: string;
  /** When set, shown in the meta row instead of postedAt (e.g. recently viewed). */
  viewedAt?: string;
}

/** Service listings show an image thumbnail on the card. */
export interface ServicePost extends MarketPostBase {
  tag: 'Service';
  /** Remote image URL for the card thumbnail. */
  thumbnail: string;
}

/** Request listings keep the text-only card layout. */
export interface RequestPost extends MarketPostBase {
  tag: 'Request';
}

export type FeaturedPost = ServicePost | RequestPost;

export interface PostAuthor {
  fullName: string;
  username: string;
  avatarUrl: string;
  /** Shown on service detail only — the person offering the service. */
  skills?: string[];
}

/** Full-screen post detail (service or request). */
export interface PostDetail {
  id: string;
  tag: MarketPostTag;
  title: string;
  /** One or more images attached to the listing. */
  images: string[];
  postedDate: string;
  categoryTags: string[];
  price: PostPrice;
  fullDescription: string;
  hashtags: string[];
  author: PostAuthor;
}
