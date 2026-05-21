import type { ProviderProfile } from '../types/market';
import { FEATURED_POSTS_MOCK, RECENTLY_VIEWED_MOCK } from './marketMock';
const avatar = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;

const ALL_FEED_POSTS = [...RECENTLY_VIEWED_MOCK, ...FEATURED_POSTS_MOCK];

function postsForAuthor(displayName: string, extraIds: string[] = []): ProviderProfile['posts'] {
  const byName = ALL_FEED_POSTS.filter((p) => p.authorName === displayName);
  const byId = ALL_FEED_POSTS.filter((p) => extraIds.includes(p.id));
  const seen = new Set<string>();
  return [...byName, ...byId].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export const PROVIDER_PROFILES_MOCK: Record<string, ProviderProfile> = {
  jordanp: {
    username: 'jordanp',
    displayName: 'Jordan P.',
    handle: '@jordanp',
    avatarUrl: avatar('jordanp'),
    bio:
      'Math & STEM tutor on campus. I help with calculus, linear algebra, and exam prep through structured weekly sessions and flexible Zoom slots.',
    skills: ['Calculus', 'Linear Algebra', 'STEM Tutoring'],
    posts: [
      ...postsForAuthor('Jordan P.'),
      {
        id: 'jp-req-1',
        title: 'Study partner for Linear Algebra final',
        description:
          'Looking for someone to review practice exams and problem sets twice a week before finals week.',
        authorName: 'Jordan P.',
        authorInitials: 'JP',
        tag: 'Request',
        price: { kind: 'negotiated' },
        postedAt: '2d ago',
      },
    ],
  },
  mialdesign: {
    username: 'mialdesign',
    displayName: 'Mia L.',
    handle: '@mialdesign',
    avatarUrl: avatar('mialdesign'),
    bio:
      'Graphic designer for student orgs — posters, social kits, and brand assets with fast turnaround before your next event.',
    skills: ['Illustrator', 'Photoshop', 'Brand Identity'],
    posts: postsForAuthor('Mia L.'),
  },
  christdev: {
    username: 'christdev',
    displayName: 'Chris T.',
    handle: '@christdev',
    avatarUrl: avatar('christdev'),
    bio:
      'Full-stack student developer building portfolio sites and campus tools with React, TypeScript, and modern deployment workflows.',
    skills: ['React', 'TypeScript', 'UI Implementation'],
    posts: [
      ...postsForAuthor('Chris T.'),
      {
        id: 'ct-req-1',
        title: 'Logo refresh for hackathon team',
        description:
          'Need a simple wordmark and favicon set before our submission deadline next Friday.',
        authorName: 'Chris T.',
        authorInitials: 'CT',
        tag: 'Request',
        price: { kind: 'fixed', amount: 25 },
        postedAt: '1w ago',
      },
    ],
  },
  priyacodes: {
    username: 'priyacodes',
    displayName: 'Priya N.',
    handle: '@priyacodes',
    avatarUrl: avatar('priyacodes'),
    bio:
      'CS student teaching Python fundamentals and data structures through short bootcamps and one-on-one sessions.',
    skills: ['Python', 'Teaching', 'Data Structures'],
    posts: postsForAuthor('Priya N.'),
  },
  samruns: {
    username: 'samruns',
    displayName: 'Sam R.',
    handle: '@samruns',
    avatarUrl: avatar('samruns'),
    bio:
      'Campus errands and laundry runs for busy weeks — reliable pickup and delivery near the quad.',
    skills: ['Reliability', 'On-time Delivery', 'Campus Logistics'],
    posts: postsForAuthor('Sam R.'),
  },
  alexkwrites: {
    username: 'alexkwrites',
    displayName: 'Alex K.',
    handle: '@alexkwrites',
    avatarUrl: avatar('alexkwrites'),
    bio:
      'English major offering detailed edits on research papers, personal statements, and lab reports with quick turnaround.',
    skills: ['Academic Writing', 'APA Style', 'Personal Statements'],
    posts: postsForAuthor('Alex K.'),
  },
  taylorw: {
    username: 'taylorw',
    displayName: 'Taylor W.',
    handle: '@taylorw',
    avatarUrl: avatar('taylorw'),
    bio:
      'Content creator looking for collaborators on campus vlogs, interview series, and YouTube Shorts.',
    skills: ['Content Strategy', 'YouTube', 'Campus Media'],
    posts: postsForAuthor('Taylor W.'),
  },
  sarahm: {
    username: 'sarahm',
    displayName: 'Sarah M.',
    handle: '@sarahm',
    avatarUrl: avatar('sarahm'),
    bio:
      'Entrepreneurship student building a campus marketplace MVP — seeking developers and designers for demo day.',
    skills: ['Product', 'Startups', 'Campus Networking'],
    posts: postsForAuthor('Sarah M.'),
  },
};
