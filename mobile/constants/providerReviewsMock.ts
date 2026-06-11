import type { ProviderReview } from '../types/review';

/** Seed reviews shown on provider profile pages (in addition to user-submitted reviews). */
export const PROVIDER_REVIEWS_MOCK: Record<string, ProviderReview[]> = {
  you: [
    {
      id: 'rev-you-1',
      revieweeUsername: 'you',
      authorDisplayName: 'Jordan P.',
      authorInitials: 'JP',
      rating: 5,
      comment: 'Excellent tutoring session! Concepts finally clicked, and scheduling was super easy.',
      serviceTitle: 'Campus tutoring — math & physics',
      createdAt: 'Jun 5, 2026',
    },
    {
      id: 'rev-you-2',
      revieweeUsername: 'you',
      authorDisplayName: 'Mia L.',
      authorInitials: 'ML',
      rating: 4,
      comment: 'Resume review was detailed and helpful for the upcoming career fair!',
      serviceTitle: 'Resume & cover letter review',
      createdAt: 'May 28, 2026',
    },
  ],
  jordanp: [
    {
      id: 'rev-jp-1',
      revieweeUsername: 'jordanp',
      authorDisplayName: 'Alex M.',
      authorInitials: 'AM',
      rating: 5,
      comment:
        'Clear explanations and flexible scheduling. Calc II finally makes sense after our sessions.',
      serviceTitle: 'Calculus II Tutoring',
      createdAt: 'Apr 2, 2026',
    },
    {
      id: 'rev-jp-2',
      revieweeUsername: 'jordanp',
      authorDisplayName: 'Sam R.',
      authorInitials: 'SR',
      rating: 4,
      comment: 'Very patient and prepared. Would book again before finals.',
      serviceTitle: 'STEM Tutoring',
      createdAt: 'Mar 18, 2026',
    },
  ],
  mialdesign: [
    {
      id: 'rev-ml-1',
      revieweeUsername: 'mialdesign',
      authorDisplayName: 'Campus Events Club',
      authorInitials: 'CE',
      rating: 5,
      comment: 'Poster design was exactly what we needed — fast turnaround and great communication.',
      serviceTitle: 'Event Poster Design',
      createdAt: 'May 5, 2026',
    },
  ],
  christdev: [
    {
      id: 'rev-ct-1',
      revieweeUsername: 'christdev',
      authorDisplayName: 'Jordan P.',
      authorInitials: 'JP',
      rating: 5,
      comment: 'Shipped a clean portfolio site ahead of schedule. Highly recommend.',
      serviceTitle: 'Portfolio Website',
      createdAt: 'Feb 28, 2026',
    },
    {
      id: 'rev-ct-2',
      revieweeUsername: 'christdev',
      authorDisplayName: 'Mia L.',
      authorInitials: 'ML',
      rating: 4,
      comment: 'Solid React work and good documentation handoff.',
      serviceTitle: 'React Component Library',
      createdAt: 'Jan 12, 2026',
    },
  ],
};
