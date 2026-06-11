import type { PopularService, FeaturedPost } from '../types/market';
import { MARKET_POST_THUMBNAILS } from './marketPostImages';

export const POPULAR_SERVICES_MOCK: PopularService[] = [
  {
    id: 'tutoring-1',
    categoryId: 'tutoring',
    title: 'STEM & Math Tutoring',
    icon: 'calculator-outline',
    accentColor: '#7C3AED',
  },
  {
    id: 'tech-1',
    categoryId: 'tech',
    title: 'Website & App Dev',
    icon: 'code-slash-outline',
    accentColor: '#2563EB',
  },
  {
    id: 'design-2',
    categoryId: 'design',
    title: 'UI Mockups & Prototypes',
    icon: 'color-palette-outline',
    accentColor: '#EA580C',
  },
  {
    id: 'career-1',
    categoryId: 'career',
    title: 'Resume & CV Review',
    icon: 'document-text-outline',
    accentColor: '#059669',
  },
  {
    id: 'campus-1',
    categoryId: 'campus',
    title: 'Laundry & Pickup',
    icon: 'shirt-outline',
    accentColor: '#DB2777',
  },
];

export const RECENTLY_VIEWED_MOCK: FeaturedPost[] = [
  {
    id: 'rv-1',
    title: 'Calculus II Weekly Sessions',
    description:
      'Structured weekly tutoring for Calc II — homework help, exam prep, and concept reviews on campus or online.',
    authorName: 'Jordan P.',
    authorInitials: 'JP',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.tutoring,
    price: { kind: 'range', min: 20, max: 30 },
    postedAt: '3d ago',
    viewedAt: '2h ago',
  },
  {
    id: 'rv-2',
    title: 'Club Event Poster Design',
    description:
      'Eye-catching posters and social assets for student org events. Fast turnaround before your next meeting.',
    authorName: 'Mia L.',
    authorInitials: 'ML',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.design,
    price: { kind: 'fixed', amount: 35 },
    postedAt: '5d ago',
    viewedAt: 'Yesterday',
  },
  {
    id: 'rv-3',
    title: 'Portfolio Website Build',
    description:
      'Personal portfolio site with responsive layout, project gallery, and contact form — great for job applications.',
    authorName: 'Chris T.',
    authorInitials: 'CT',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.development,
    price: { kind: 'negotiated' },
    postedAt: '2w ago',
    viewedAt: '3d ago',
  },
  {
    id: 'rv-4',
    title: 'Intro to Python Crash Course',
    description:
      'Four-session beginner bootcamp covering syntax, loops, and small projects — perfect before your CS midterm.',
    authorName: 'Priya N.',
    authorInitials: 'PN',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.bootcamp,
    price: { kind: 'fixed', amount: 50 },
    postedAt: '1w ago',
    viewedAt: '5h ago',
  },
  {
    id: 'rv-5',
    title: 'Laundry Pickup & Delivery',
    description:
      'Busy week? I will pick up, wash, fold, and return within 24 hours for dorms near the quad.',
    authorName: 'Sam R.',
    authorInitials: 'SR',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.laundry,
    price: { kind: 'fixed', amount: 18 },
    postedAt: '4d ago',
    viewedAt: '1d ago',
  },
  {
    id: 'rv-6',
    title: 'Video Editor for YouTube Channel',
    description:
      'Need clean cuts, captions, and light color grading for weekly campus vlogs and interview clips.',
    authorName: 'Taylor W.',
    authorInitials: 'TW',
    tag: 'Request',
    price: { kind: 'range', min: 40, max: 60 },
    postedAt: '6d ago',
    viewedAt: '4d ago',
  },
];

export const FEATURED_POSTS_MOCK: FeaturedPost[] = [
  // Services
  {
    id: '1',
    title: 'Professional essay editing & proofreading',
    description:
      'English major offering fast turnaround on research papers, personal statements, and lab reports.',
    authorName: 'Alex K.',
    authorInitials: 'AK',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.editing,
    price: { kind: 'fixed', amount: 50 },
    postedAt: '1d ago',
  },
  {
    id: '3',
    title: 'Organic Chemistry Tutoring',
    description:
      'Chemistry senior here to help you through mechanisms, reactions, and lab reports. Flexible scheduling.',
    authorName: 'Emily L.',
    authorInitials: 'EL',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.tutoring,
    price: { kind: 'fixed', amount: 25 },
    postedAt: '2d ago',
  },
  {
    id: '4',
    title: 'Social Media Content Creation',
    description:
      'Creative student specializing in Instagram and TikTok content for clubs and small businesses on campus.',
    authorName: 'Zoe M.',
    authorInitials: 'ZM',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.design,
    price: { kind: 'range', min: 30, max: 75 },
    postedAt: '4d ago',
  },
  {
    id: '5',
    title: 'LinkedIn Profile Optimization',
    description:
      'Career Services peer advisor with a 95% success rate in helping students land interviews.',
    authorName: 'David R.',
    authorInitials: 'DR',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.editing,
    price: { kind: 'fixed', amount: 40 },
    postedAt: '5d ago',
  },
  {
    id: '6',
    title: 'Grocery Shopping & Delivery',
    description:
      'Free up your time! I’ll shop for you and deliver right to your dorm or apartment on campus.',
    authorName: 'Jamie S.',
    authorInitials: 'JS',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.laundry,
    price: { kind: 'fixed', amount: 15 },
    postedAt: '1w ago',
  },
  {
    id: '7',
    title: 'Full-Stack Web Development',
    description:
      'Build your next project with React, Node.js, and Firebase. Let’s bring your idea to life!',
    authorName: 'Morgan H.',
    authorInitials: 'MH',
    tag: 'Service',
    thumbnail: MARKET_POST_THUMBNAILS.development,
    price: { kind: 'range', min: 100, max: 300 },
    postedAt: '1w ago',
  },

  // Requests
  {
    id: '2',
    title: 'Need a developer for campus marketplace MVP',
    description:
      'Looking for a student developer to help finish our React Native app before demo day. Flexible hours on campus.',
    authorName: 'Sarah M.',
    authorInitials: 'SM',
    tag: 'Request',
    price: { kind: 'range', min: 200, max: 400 },
    postedAt: '4h ago',
  },
  {
    id: '8',
    title: 'Seeking photography for graduation',
    description:
      'Graduating in June and need professional-looking photos for LinkedIn and family. Looking for a student photographer.',
    authorName: 'Kevin B.',
    authorInitials: 'KB',
    tag: 'Request',
    price: { kind: 'negotiated' },
    postedAt: '1d ago',
  },
  {
    id: '9',
    title: 'Need help moving into off-campus apartment',
    description:
      'Looking for a few helpers to move boxes and furniture this weekend. Willing to pay per person/hour.',
    authorName: 'Lisa C.',
    authorInitials: 'LC',
    tag: 'Request',
    price: { kind: 'range', min: 15, max: 25 },
    postedAt: '2d ago',
  },
  {
    id: '10',
    title: 'Looking for study group for CS 101',
    description:
      'Need peers to study with for upcoming midterm! We can meet in the library or online.',
    authorName: 'Ryan T.',
    authorInitials: 'RT',
    tag: 'Request',
    price: { kind: 'negotiated' },
    postedAt: '3d ago',
  },
  {
    id: '11',
    title: 'Need someone to walk my dog on campus',
    description:
      'Looking for a responsible student to walk my golden retriever twice a week near the campus quad.',
    authorName: 'Nina W.',
    authorInitials: 'NW',
    tag: 'Request',
    price: { kind: 'fixed', amount: 20 },
    postedAt: '4d ago',
  },
];

/** Promo copy for the market discovery banner. */
export const MARKET_PROMO = {
  title: 'Campus skills, right next door',
  subtitle: 'Explore the services of your peers today',
} as const;
