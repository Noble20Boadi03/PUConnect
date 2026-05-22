import type { Href } from 'expo-router';

/** Opens service providers list under `app/category/[id]/service/[serviceId].tsx`. */
export function buildExploreServiceHref(categoryId: string, serviceId: string): Href {
  return {
    pathname: '/category/[id]/service/[serviceId]',
    params: { id: categoryId, serviceId },
  };
}
