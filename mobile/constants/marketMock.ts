import type { PopularService, FeaturedPost } from '../types/market';

export const POPULAR_SERVICES_MOCK: PopularService[] = [
  {
    id: '1',
    title: 'Subject Tutoring',
    icon: 'book-outline',
    accentColor: '#7C3AED',
  },
  {
    id: '2',
    title: 'Website & App Development',
    icon: 'code-slash-outline',
    accentColor: '#2563EB',
  },
  {
    id: '3',
    title: 'Graphic Design',
    icon: 'color-palette-outline',
    accentColor: '#EA580C',
  },
  {
    id: '4',
    title: 'Resume Review',
    icon: 'document-text-outline',
    accentColor: '#059669',
  },
  {
    id: '5',
    title: 'Photography',
    icon: 'camera-outline',
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
    priceLabel: '$20/hr',
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
    priceLabel: '$35',
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
    priceLabel: '$120',
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
    priceLabel: '$60',
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
    priceLabel: '$18/load',
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
    priceLabel: '$50/video',
    postedAt: '6d ago',
    viewedAt: '4d ago',
  },
];

export const FEATURED_POSTS_MOCK: FeaturedPost[] = [
  {
    id: '1',
    title: 'Need a developer for campus marketplace MVP',
    description:
      'Looking for a student developer to help finish our React Native app before demo day. Flexible hours on campus.',
    authorName: 'Sarah M.',
    authorInitials: 'SM',
    tag: 'Request',
    priceLabel: '$200–$400',
    postedAt: '4h ago',
  },
  {
    id: '2',
    title: 'Professional essay editing & proofreading',
    description:
      'English major offering fast turnaround on research papers, personal statements, and lab reports.',
    authorName: 'Alex K.',
    authorInitials: 'AK',
    tag: 'Service',
    priceLabel: '$15/page',
    postedAt: '1d ago',
  },
];

/** Promo copy for the market discovery banner. */
export const MARKET_PROMO = {
  title: 'Campus skills, right next door',
  subtitle: 'Explore the services of your peers today',
} as const;
