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
