import { EXPLORE_CATEGORIES_MOCK } from './exploreMock';
import { EXPLORE_CATEGORY_SERVICES_MOCK } from './exploreCategoryServicesMock';
import type { ExploreCategoryId, ExploreCategoryService } from '../types/explore';

export interface EditInfoServiceOption {
  id: string;
  title: string;
  categoryId: ExploreCategoryId;
  categoryLabel: string;
  /** Tags a provider can select when offering this service. */
  tags: string[];
}

const categoryLabelById = Object.fromEntries(
  EXPLORE_CATEGORIES_MOCK.map((c) => [c.id, c.pillLabel])
) as Record<ExploreCategoryId, string>;

/** All explore category services, flattened for the Edit Info provider form. */
export const EDIT_INFO_SERVICE_OPTIONS: EditInfoServiceOption[] = (
  Object.values(EXPLORE_CATEGORY_SERVICES_MOCK) as ExploreCategoryService[][]
)
  .flat()
  .map((service) => ({
    id: service.id,
    title: service.title,
    categoryId: service.categoryId,
    categoryLabel: categoryLabelById[service.categoryId],
    tags: [...service.filterTags],
  }))
  .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel) || a.title.localeCompare(b.title));

/** Mock tags keyed by explore service id (aligned with category detail + People filters). */
export const SERVICE_TAGS_BY_SERVICE_ID: Record<string, string[]> = Object.fromEntries(
  EDIT_INFO_SERVICE_OPTIONS.map((s) => [s.id, s.tags])
);

/** Services grouped by category for the picker sheet. */
export const EDIT_INFO_SERVICES_BY_CATEGORY = EXPLORE_CATEGORIES_MOCK.map((category) => ({
  categoryId: category.id,
  categoryLabel: category.pillLabel,
  services: EDIT_INFO_SERVICE_OPTIONS.filter((s) => s.categoryId === category.id),
})).filter((group) => group.services.length > 0);
