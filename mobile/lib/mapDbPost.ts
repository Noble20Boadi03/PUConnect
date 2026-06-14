import { MARKET_POST_THUMBNAILS } from '../constants/marketPostImages';
import type { DbPost, FeaturedPost, PostDetail, PostPrice, ProviderProfile } from '../types';
import { formatPostedDate, formatRelativeTime } from './formatRelativeTime';

const DEFAULT_THUMBNAIL = MARKET_POST_THUMBNAILS.tutoring;

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
    categoryTags: post.hashtags,
    price: parsePostPrice(post.price),
    fullDescription: post.description,
    hashtags: post.hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)),
    author: {
      fullName: author?.name ?? 'Unknown',
      username: `@${username}`,
      avatarUrl: author?.avatarUrl || `https://i.pravatar.cc/256?u=${username}`,
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
}

export function mapApiProfileToProviderProfile(data: ApiProfileResponse): ProviderProfile {
  return {
    username: data.username,
    displayName: data.name,
    handle: data.username,
    avatarUrl: data.avatarUrl || `https://i.pravatar.cc/256?u=${data.username}`,
    bio: data.bio ?? '',
    skills: data.expertiseTags ?? [],
    posts: (data.posts ?? []).map(mapDbPostToFeaturedPost),
  };
}
