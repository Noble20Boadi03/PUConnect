import type { Href } from 'expo-router';
import type { ExploreCategoryId } from '../types/explore';

/** Opens `app/category/[id].tsx` on the root stack (use with `pushStack`). */
export function buildExploreCategoryHref(categoryId: ExploreCategoryId | string): Href {
  return {
    pathname: '/category/[id]',
    params: { id: categoryId },
  };
}
