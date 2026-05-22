import type { ExploreCategory, ExploreProvider } from '../types/explore';
import { EXPLORE_CATEGORY_IMAGES } from './exploreCategoryImages';

const avatar = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;

export const EXPLORE_CATEGORIES_MOCK: ExploreCategory[] = [
  {
    id: 'tutoring',
    title: 'Tutoring & Academics',
    pillLabel: 'Tutoring',
    description:
      'Math, science, writing help, exam prep, and study partners for tough courses.',
    imageUrl: EXPLORE_CATEGORY_IMAGES.tutoring,
    accentColor: '#7C3AED',
  },
  {
    id: 'tech',
    title: 'Tech & Development',
    pillLabel: 'Tech',
    description:
      'Websites, apps, debugging, portfolio builds, and campus tool prototypes.',
    imageUrl: EXPLORE_CATEGORY_IMAGES.tech,
    accentColor: '#2563EB',
  },
  {
    id: 'design',
    title: 'Design & Creative',
    pillLabel: 'Design',
    description:
      'Posters, branding, UI mockups, photography, and social media assets.',
    imageUrl: EXPLORE_CATEGORY_IMAGES.design,
    accentColor: '#EA580C',
  },
  {
    id: 'career',
    title: 'Career & Professional',
    pillLabel: 'Career',
    description:
      'Resume reviews, interview prep, LinkedIn polish, and personal statements.',
    imageUrl: EXPLORE_CATEGORY_IMAGES.career,
    accentColor: '#059669',
  },
  {
    id: 'campus',
    title: 'Campus Life & Errands',
    pillLabel: 'Campus',
    description:
      'Laundry runs, deliveries, moving help, and other on-campus logistics.',
    imageUrl: EXPLORE_CATEGORY_IMAGES.campus,
    accentColor: '#DB2777',
  },
];

export const EXPLORE_PROVIDERS_MOCK: ExploreProvider[] = [
  {
    username: 'jordanp',
    displayName: 'Jordan P.',
    handle: '@jordanp',
    avatarUrl: avatar('jordanp'),
    categoryId: 'tutoring',
    skillTitle: 'Calculus & STEM Tutor',
    expertiseTags: ['CALCULUS', 'LINEAR ALGEBRA', 'EXAM PREP'],
    averageRating: 4.9,
    reviewCount: 124,
  },
  {
    username: 'mialdesign',
    displayName: 'Mia L.',
    handle: '@mialdesign',
    avatarUrl: avatar('mialdesign'),
    categoryId: 'design',
    skillTitle: 'Product Designer & UX Specialist',
    expertiseTags: ['UI DESIGN', 'UX RESEARCH', 'FIGMA'],
    averageRating: 5,
    reviewCount: 89,
  },
  {
    username: 'christdev',
    displayName: 'Chris T.',
    handle: '@christdev',
    avatarUrl: avatar('christdev'),
    categoryId: 'tech',
    skillTitle: 'Full-Stack Student Developer',
    expertiseTags: ['REACT', 'TYPESCRIPT', 'EXPO'],
    averageRating: 4.8,
    reviewCount: 56,
  },
  {
    username: 'priyacodes',
    displayName: 'Priya N.',
    handle: '@priyacodes',
    avatarUrl: avatar('priyacodes'),
    categoryId: 'tutoring',
    skillTitle: 'Python & CS Fundamentals Coach',
    expertiseTags: ['PYTHON', 'DATA STRUCTURES', 'BOOTCAMPS'],
    averageRating: 4.7,
    reviewCount: 41,
  },
  {
    username: 'samruns',
    displayName: 'Sam R.',
    handle: '@samruns',
    avatarUrl: avatar('samruns'),
    categoryId: 'campus',
    skillTitle: 'Campus Errands & Delivery',
    expertiseTags: ['LAUNDRY', 'PICKUP', 'ON-TIME'],
    averageRating: 4.9,
    reviewCount: 203,
  },
  {
    username: 'alexkwrites',
    displayName: 'Alex K.',
    handle: '@alexkwrites',
    avatarUrl: avatar('alexkwrites'),
    categoryId: 'career',
    skillTitle: 'Academic & Career Writing Editor',
    expertiseTags: ['RESUMES', 'APA STYLE', 'ESSAYS'],
    averageRating: 4.6,
    reviewCount: 37,
  },
  {
    username: 'taylorw',
    displayName: 'Taylor W.',
    handle: '@taylorw',
    avatarUrl: avatar('taylorw'),
    categoryId: 'design',
    skillTitle: 'Campus Content & Video Creator',
    expertiseTags: ['YOUTUBE', 'SHORT FORM', 'STORYTELLING'],
    averageRating: 4.5,
    reviewCount: 28,
  },
  {
    username: 'sarahm',
    displayName: 'Sarah M.',
    handle: '@sarahm',
    avatarUrl: avatar('sarahm'),
    categoryId: 'career',
    skillTitle: 'Startup Product & Pitch Coach',
    expertiseTags: ['PITCH DECKS', 'MVP', 'NETWORKING'],
    averageRating: 4.8,
    reviewCount: 19,
  },
];
