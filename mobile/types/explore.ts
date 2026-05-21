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
  description: string;
  imageUrl: string;
  accentColor: string;
}

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
  averageRating: number;
  reviewCount: number;
}
