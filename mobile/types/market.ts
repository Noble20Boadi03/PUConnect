import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type MarketIconName = ComponentProps<typeof Ionicons>['name'];

export interface PopularService {
  id: string;
  title: string;
  icon: MarketIconName;
  accentColor: string;
}

export interface FeaturedPost {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorInitials: string;
  tag: 'Service' | 'Request';
  priceLabel: string;
  postedAt: string;
  /** When set, shown in the meta row instead of postedAt (e.g. recently viewed). */
  viewedAt?: string;
}
