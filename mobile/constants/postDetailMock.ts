import type { PostDetail } from '../types/market';
import { MARKET_POST_THUMBNAILS } from './marketPostImages';

const REQUEST_HERO =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=75';
const REQUEST_ALT =
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=75';

const avatar = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;

export const POST_DETAILS_MOCK: Record<string, PostDetail> = {
  'rv-1': {
    id: 'rv-1',
    tag: 'Service',
    title: 'Calculus II Weekly Sessions',
    images: [
      MARKET_POST_THUMBNAILS.tutoring,
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=75',
      'https://images.unsplash.com/photo-1434030214721-abed731b2089?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'Mar 18, 2026',
    categoryTags: ['Tutoring', 'Mathematics', 'STEM'],
    price: { kind: 'range', min: 20, max: 30 },
    fullDescription:
      'Structured weekly tutoring for Calc II covering limits, derivatives, integrals, and exam prep. Sessions are tailored to your syllabus with homework walkthroughs, concept reviews, and practice problems. Available on campus or over Zoom — flexible evening slots.',
    hashtags: ['#calculus', '#tutoring', '#stem', '#examPrep'],
    author: {
      fullName: 'Jordan P.',
      username: '@jordanp',
      avatarUrl: avatar('jordanp'),
      skills: ['Calculus', 'Linear Algebra', 'STEM Tutoring'],
    },
  },
  'rv-2': {
    id: 'rv-2',
    tag: 'Service',
    title: 'Club Event Poster Design',
    images: [
      MARKET_POST_THUMBNAILS.design,
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'Mar 16, 2026',
    categoryTags: ['Graphic Design', 'Marketing', 'Campus Events'],
    price: { kind: 'fixed', amount: 35 },
    fullDescription:
      'Eye-catching posters and social media kits for student organizations. Includes two revision rounds, print-ready exports, and Instagram story templates. Fast turnaround before your next general body meeting.',
    hashtags: ['#graphicDesign', '#posters', '#studentOrgs', '#branding'],
    author: {
      fullName: 'Mia L.',
      username: '@mialdesign',
      avatarUrl: avatar('mialdesign'),
      skills: ['Illustrator', 'Photoshop', 'Brand Identity'],
    },
  },
  'rv-3': {
    id: 'rv-3',
    tag: 'Service',
    title: 'Portfolio Website Build',
    images: [
      MARKET_POST_THUMBNAILS.development,
      'https://images.unsplash.com/photo-1461740680684-dccba630e2f6?w=800&auto=format&fit=crop&q=75',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=75',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'Mar 7, 2026',
    categoryTags: ['Web Development', 'Portfolio', 'Freelance'],
    price: { kind: 'negotiated' },
    fullDescription:
      'Personal portfolio site with responsive layout, project gallery, about section, and contact form. Built with modern React or Next.js, deployed to Vercel, and optimized for recruiters and grad school applications.',
    hashtags: ['#webdev', '#portfolio', '#react', '#nextjs'],
    author: {
      fullName: 'Chris T.',
      username: '@christdev',
      avatarUrl: avatar('christdev'),
      skills: ['React', 'TypeScript', 'UI Implementation'],
    },
  },
  'rv-4': {
    id: 'rv-4',
    tag: 'Service',
    title: 'Intro to Python Crash Course',
    images: [MARKET_POST_THUMBNAILS.bootcamp],
    postedDate: 'Mar 14, 2026',
    categoryTags: ['Programming', 'Python', 'Bootcamp'],
    price: { kind: 'fixed', amount: 50 },
    fullDescription:
      'Four-session beginner bootcamp covering Python syntax, data types, loops, functions, and a small capstone project. Ideal before your first CS midterm. Materials and practice notebooks included.',
    hashtags: ['#python', '#coding', '#bootcamp', '#cs101'],
    author: {
      fullName: 'Priya N.',
      username: '@priyacodes',
      avatarUrl: avatar('priyacodes'),
      skills: ['Python', 'Teaching', 'Data Structures'],
    },
  },
  'rv-5': {
    id: 'rv-5',
    tag: 'Service',
    title: 'Laundry Pickup & Delivery',
    images: [
      MARKET_POST_THUMBNAILS.laundry,
      'https://images.unsplash.com/photo-1582735689369-4fe89db71181?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'Mar 17, 2026',
    categoryTags: ['Errands', 'Campus Life', 'Delivery'],
    price: { kind: 'fixed', amount: 18 },
    fullDescription:
      'Pickup, wash, fold, and return within 24 hours for dorms near the quad. Eco-friendly detergent available on request. Text me your building and bag count for a quick quote.',
    hashtags: ['#laundry', '#campusLife', '#errands', '#delivery'],
    author: {
      fullName: 'Sam R.',
      username: '@samruns',
      avatarUrl: avatar('samruns'),
      skills: ['Reliability', 'On-time Delivery', 'Campus Logistics'],
    },
  },
  'rv-6': {
    id: 'rv-6',
    tag: 'Request',
    title: 'Video Editor for YouTube Channel',
    images: [REQUEST_HERO, REQUEST_ALT],
    postedDate: 'Mar 15, 2026',
    categoryTags: ['Video Editing', 'Content Creation', 'YouTube'],
    price: { kind: 'range', min: 40, max: 60 },
    fullDescription:
      'Looking for a student editor for weekly campus vlogs and interview clips. Need clean cuts, captions, basic color grading, and exports ready for YouTube Shorts and long-form uploads.',
    hashtags: ['#videoEditing', '#youtube', '#premiere', '#content'],
    author: {
      fullName: 'Taylor W.',
      username: '@taylorw',
      avatarUrl: avatar('taylorw'),
    },
  },
  '1': {
    id: '1',
    tag: 'Request',
    title: 'Need a developer for campus marketplace MVP',
    images: [
      REQUEST_HERO,
      'https://images.unsplash.com/photo-1517694712202-14dd95375aa9?w=800&auto=format&fit=crop&q=75',
      REQUEST_ALT,
    ],
    postedDate: 'May 20, 2026',
    categoryTags: ['Mobile Development', 'React Native', 'Startup'],
    price: { kind: 'range', min: 200, max: 400 },
    fullDescription:
      'Our team needs help finishing a React Native campus marketplace app before demo day. Work includes polish on listings, auth flows, and a simple messaging UI. Flexible hours and pair-programming sessions on campus.',
    hashtags: ['#reactnative', '#mobile', '#mvp', '#expo', '#campus'],
    author: {
      fullName: 'Sarah M.',
      username: '@sarahm',
      avatarUrl: avatar('sarahm'),
    },
  },
  '2': {
    id: '2',
    tag: 'Service',
    title: 'Professional essay editing & proofreading',
    images: [
      MARKET_POST_THUMBNAILS.editing,
      'https://images.unsplash.com/photo-1455390572672-7c6a028af77a?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'May 19, 2026',
    categoryTags: ['Writing', 'Editing', 'Academic'],
    price: { kind: 'fixed', amount: 50 },
    fullDescription:
      'English major offering detailed edits on research papers, personal statements, and lab reports. Feedback covers structure, clarity, grammar, and citation checks with 48-hour turnaround on most assignments.',
    hashtags: ['#editing', '#writing', '#essays', '#proofreading'],
    author: {
      fullName: 'Alex K.',
      username: '@alexkwrites',
      avatarUrl: avatar('alexkwrites'),
      skills: ['Academic Writing', 'APA Style', 'Personal Statements'],
    },
  },
};
