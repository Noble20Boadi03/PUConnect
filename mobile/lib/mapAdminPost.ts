import type { FeaturedPost } from '../types';
import type { AdminPost } from '../services/adminService';
import { parsePostPrice } from './mapDbPost';

export function mapAdminPostToFeaturedPost(post: AdminPost): FeaturedPost {
  const images = post.images?.length ? post.images : [];
  const authorName = post.authorName ?? post.authorUsername ?? 'Unknown';
  const postedAt = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (post.tag === 'Service') {
    return {
      id: post.id,
      title: post.title,
      description: post.description ?? '',
      authorId: post.authorId,
      authorName,
      authorInitials: authorName.slice(0, 2).toUpperCase(),
      tag: 'Service',
      thumbnail: images[0] ?? '',
      images,
      price: parsePostPrice(post.price),
      postedAt,
    };
  }

  return {
    id: post.id,
    title: post.title,
    description: post.description ?? '',
    authorId: post.authorId,
    authorName,
    authorInitials: authorName.slice(0, 2).toUpperCase(),
    tag: 'Request',
    ...(images.length ? { thumbnail: images[0], images } : {}),
    price: parsePostPrice(post.price),
    postedAt,
  };
}
