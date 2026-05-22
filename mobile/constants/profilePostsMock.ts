import type { FeaturedPost } from '../types/market';
import { MARKET_POST_THUMBNAILS } from './marketPostImages';

/** Fallback posts for the signed-in profile when no provider mock exists for the username. */
export const DEFAULT_OWNER_POSTS_MOCK: FeaturedPost[] = [
  {
    id: 'owner-svc-1',
    title: 'Campus tutoring — math & physics',
    description:
      'One-on-one sessions for intro calculus and physics. Flexible evenings on campus or over Zoom.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.tutoring,
    price: { kind: 'range', min: 18, max: 28 },
    postedAt: '3d ago',
  },
  {
    id: 'owner-req-1',
    title: 'Need help with portfolio website',
    description:
      'Looking for a peer who can polish my personal site before career fair — React or simple static pages.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Request',
    price: { kind: 'negotiated' },
    postedAt: '1w ago',
  },
];
