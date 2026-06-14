import type { FeaturedPost } from '../types/market';
import { MARKET_POST_THUMBNAILS } from './marketPostImages';

/** Prefix for owner profile post ids — used for detail lookup and personalization. */
export const OWNER_POST_ID_PREFIX = 'owner-' as const;

/**
 * Fallback posts for the signed-in profile when no provider mock exists for the username.
 * Mirrors the market feed card shape (service thumbnails, varied prices, campus-themed copy).
 */
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
    images: [MARKET_POST_THUMBNAILS.tutoring, MARKET_POST_THUMBNAILS.editing],
    price: { kind: 'range', min: 18, max: 28 },
    postedAt: '3d ago',
  },
  {
    id: 'owner-svc-2',
    title: 'Resume & cover letter review',
    description:
      'Detailed feedback on structure, wording, and ATS-friendly formatting before career fair week.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.editing,
    images: [MARKET_POST_THUMBNAILS.editing, MARKET_POST_THUMBNAILS.bootcamp, MARKET_POST_THUMBNAILS.design],
    price: { kind: 'fixed', amount: 40 },
    postedAt: '5d ago',
  },
  {
    id: 'owner-svc-3',
    title: 'Club flyer & social media graphics',
    description:
      'Quick-turnaround posters, Instagram stories, and tabling banners for student organizations.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.design,
    images: [MARKET_POST_THUMBNAILS.design, MARKET_POST_THUMBNAILS.tutoring, MARKET_POST_THUMBNAILS.laundry, MARKET_POST_THUMBNAILS.editing],
    price: { kind: 'range', min: 25, max: 45 },
    postedAt: '1w ago',
  },
  {
    id: 'owner-svc-4',
    title: 'Intro Python homework help',
    description:
      'Walk through loops, functions, and small projects — great before your first CS midterm.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.bootcamp,
    images: [MARKET_POST_THUMBNAILS.bootcamp],
    price: { kind: 'fixed', amount: 30 },
    postedAt: '2w ago',
  },
  {
    id: 'owner-svc-5',
    title: 'Dorm move-in & move-out hauling',
    description:
      'Help loading boxes, furniture, and mini-fridges between campus housing and storage units.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.laundry,
    images: [MARKET_POST_THUMBNAILS.laundry, MARKET_POST_THUMBNAILS.editing],
    price: { kind: 'negotiated' },
    postedAt: '3w ago',
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
  {
    id: 'owner-req-2',
    title: 'Study partner for organic chemistry midterm',
    description:
      'Want to meet twice a week to review mechanisms, nomenclature, and practice exams at the library.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Request',
    price: { kind: 'negotiated' },
    postedAt: '4d ago',
  },
  {
    id: 'owner-req-3',
    title: 'Video editor for student org recap',
    description:
      'Need clean cuts, captions, and light color grading for a 3-minute end-of-semester highlight reel.',
    authorName: 'You',
    authorInitials: 'ME',
    tag: 'Request',
    price: { kind: 'range', min: 35, max: 55 },
    postedAt: '6d ago',
  },
];
