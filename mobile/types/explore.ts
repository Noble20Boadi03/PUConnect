import type { MarketIconName } from './market';

/** Top-level Explore screen tabs. */
export type ExploreTab = 'categories' | 'people';

/** Main service category identifiers (Categories tab + People filters). */
export type ExploreCategoryId =
  | 'tutoring'
  | 'tech'
  | 'design'
  | 'career'
  | 'campus';

/** People tab filter — all providers or one main category. */
export type ExploreCategoryFilter = 'all' | ExploreCategoryId;

export interface ExploreCategory {
  id: ExploreCategoryId;
  title: string;
  /** Short label for People tab filter pills. */
  pillLabel: string;
  /** Shown on the category detail hero. */
  tagline: string;
  description: string;
  imageUrl: string;
  accentColor: string;
  iconName: MarketIconName;
}

/** A service listed under a category on the detail page. */
export interface ExploreCategoryService {
  id: string;
  categoryId: ExploreCategoryId;
  title: string;
  description: string;
  /** Pills on the service providers screen (match provider `expertiseTags`). */
  filterTags: string[];
}

/** Tag pill filter on a service providers screen (`all` = no tag filter). */
export type ExploreServiceTagFilter = 'all' | string;

export interface ExploreProvider {
  username: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  categoryId: ExploreCategoryId;
  /** One-line role / expertise headline. */
  skillTitle: string;
  /** Uppercase-style expertise tags shown as pills. */
  expertiseTags: string[];
  /** Services this provider offers (category detail → service list). */
  serviceIds: string[];
  averageRating: number;
  reviewCount: number;
}
