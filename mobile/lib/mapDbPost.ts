import { MARKET_POST_THUMBNAILS } from '../constants/marketPostImages';
import type { DbPost, FeaturedPost, PostDetail, PostPrice, ProviderProfile } from '../types';
import { formatPostedDate, formatRelativeTime } from './formatRelativeTime';
import { getServiceOptionsByIds } from './editInfoForm';

const DEFAULT_THUMBNAIL = MARKET_POST_THUMBNAILS.tutoring;

function initialsFromName(name: string): string {
  if (!name) return '??';
  
  // Clean the name and handle edge cases
  const cleanedName = name.trim();
  if (!cleanedName) return '??';
  
  const parts = cleanedName.split(/\s+/).filter(Boolean);
  
  // If only one part, take first 2 characters (or 1 if only 1 exists)
  if (parts.length === 1) {
    return cleanedName.slice(0, 2).toUpperCase();
  }
  
  // If multiple parts, take first character of first two parts
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function parsePostPrice(price: unknown): PostPrice {
  if (price && typeof price === 'object' && 'kind' in price) {
    return price as PostPrice;
  }
  return { kind: 'negotiated' };
}

export function mapDbPostToFeaturedPost(post: DbPost): FeaturedPost {
  const authorName = post.author?.name ?? 'Unknown';
  const postedAt = formatRelativeTime(post.createdAt);
  const price = parsePostPrice(post.price);

  if (post.tag === 'Service') {
    const images = post.images.length > 0 ? post.images : [DEFAULT_THUMBNAIL];
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      authorId: post.authorId,
      authorName,
      authorInitials: initialsFromName(authorName),
      tag: 'Service',
      thumbnail: images[0],
      images,
      price,
      postedAt,
    };
  }

  return {
    id: post.id,
    title: post.title,
    description: post.description,
    authorId: post.authorId,
    authorName,
    authorInitials: initialsFromName(authorName),
    tag: 'Request',
    price,
    postedAt,
  };
}

export function mapDbPostToPostDetail(post: DbPost): PostDetail {
  const author = post.author;
  const username = author?.username ?? 'unknown';

  return {
    id: post.id,
    tag: post.tag,
    title: post.title,
    images:
      post.images.length > 0
        ? post.images
        : post.tag === 'Service'
          ? [DEFAULT_THUMBNAIL]
          : [],
    postedDate: formatPostedDate(post.createdAt),
    categoryTags: post.helpCategoryIds,
    price: parsePostPrice(post.price),
    fullDescription: post.description,
    hashtags: post.hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)),
    author: {
      fullName: author?.name ?? 'Unknown',
      username: `@${username}`,
      avatarUrl: author?.avatarUrl || '',
    },
  };
}

export interface ApiProfileResponse {
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  expertiseTags?: string[];
  role?: string;
  posts?: DbPost[];
  services?: Array<{ id: string; title: string; categoryId: string }>;
  serviceIds?: string[];
}

export function mapApiProfileToProviderProfile(data: ApiProfileResponse): ProviderProfile {
  let serviceTitles = data.services?.map((s) => s.title);
  if (!serviceTitles || serviceTitles.length === 0) {
    const ids = data.serviceIds || [];
    const localServices = getServiceOptionsByIds(ids);
    if (localServices.length > 0) {
      serviceTitles = localServices.map((s) => s.title);
    }
  }
  
  return {
    username: data.username,
    displayName: data.name,
    handle: data.username,
    avatarUrl: data.avatarUrl || '',
    initials: initialsFromName(data.name || data.username),
    bio: data.bio ?? '',
    skills: (serviceTitles && serviceTitles.length > 0) ? serviceTitles : [],
    posts: (data.posts ?? []).map(mapDbPostToFeaturedPost),
  };
}
