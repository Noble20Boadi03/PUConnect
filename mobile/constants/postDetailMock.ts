import type { PostDetail } from '../types/market';
import { MARKET_POST_THUMBNAILS } from './marketPostImages';

const REQUEST_HERO =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=75';
const REQUEST_ALT =
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=75';

const avatar = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;

export const POST_DETAILS_MOCK: Record<string, PostDetail> = {
  '3': {
    id: '3',
    tag: 'Service',
    title: 'Organic Chemistry Tutoring',
    images: [
      MARKET_POST_THUMBNAILS.tutoring,
      'https://images.unsplash.com/photo-1434030214721-abed731b2089?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'May 18, 2026',
    categoryTags: ['Tutoring', 'Chemistry', 'STEM'],
    price: { kind: 'fixed', amount: 25 },
    fullDescription:
      'Chemistry senior here to help you through mechanisms, reactions, stereochemistry, and lab reports! Flexible evening and weekend slots, with whiteboard sessions in the library or Zoom calls. Includes homework walkthroughs and practice exam prep tailored to your professor’s syllabus.',
    hashtags: ['#organicChemistry', '#tutoring', '#stem', '#examPrep'],
    author: {
      fullName: 'Emily L.',
      username: '@emilyl',
      avatarUrl: avatar('emilyl'),
      skills: ['Organic Chemistry', 'Biochem', 'Lab Reports'],
    },
  },
  '4': {
    id: '4',
    tag: 'Service',
    title: 'Social Media Content Creation',
    images: [
      MARKET_POST_THUMBNAILS.design,
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'May 16, 2026',
    categoryTags: ['Social Media', 'Content Creation', 'Marketing'],
    price: { kind: 'range', min: 30, max: 75 },
    fullDescription:
      'Creative student specializing in Instagram Reels/TikToks, carousel posts, and Instagram stories for clubs and small businesses on campus! Fast turnaround with two revision rounds, and Canva templates included so you can keep creating after the project ends.',
    hashtags: ['#socialMedia', '#contentCreation', '#studentOrgs', '#branding'],
    author: {
      fullName: 'Zoe M.',
      username: '@zoem',
      avatarUrl: avatar('zoem'),
      skills: ['Instagram', 'TikTok', 'Canva', 'Content Strategy'],
    },
  },
  '5': {
    id: '5',
    tag: 'Service',
    title: 'LinkedIn Profile Optimization',
    images: [
      MARKET_POST_THUMBNAILS.editing,
      'https://images.unsplash.com/photo-1455390572672-7c6a028af77a?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'May 15, 2026',
    categoryTags: ['Career', 'LinkedIn', 'Personal Branding'],
    price: { kind: 'fixed', amount: 40 },
    fullDescription:
      'Career Services peer advisor with a 95% success rate in helping students land interviews! I’ll polish your headline, summary, experience bullet points, and optimize for ATS keywords. Includes a 30-minute Zoom call to discuss your career goals.',
    hashtags: ['#linkedin', '#career', '#personalBranding', '#jobSearch'],
    author: {
      fullName: 'David R.',
      username: '@davidr',
      avatarUrl: avatar('davidr'),
      skills: ['Resume Writing', 'LinkedIn Optimization', 'Interview Prep'],
    },
  },
  '6': {
    id: '6',
    tag: 'Service',
    title: 'Grocery Shopping & Delivery',
    images: [
      MARKET_POST_THUMBNAILS.laundry,
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'May 10, 2026',
    categoryTags: ['Errands', 'Campus Life', 'Delivery'],
    price: { kind: 'fixed', amount: 15 },
    fullDescription:
      'Free up your time! I’ll do your grocery shopping and deliver right to your dorm or off-campus apartment near campus! Send me your list or Instacart cart, and I’ll pick everything up — including frozen foods with insulated bags!',
    hashtags: ['#grocery', '#errands', '#campusLife', '#delivery'],
    author: {
      fullName: 'Jamie S.',
      username: '@jamies',
      avatarUrl: avatar('jamies'),
      skills: ['Reliability', 'On-time Delivery', 'Organized Shopping'],
    },
  },
  '7': {
    id: '7',
    tag: 'Service',
    title: 'Full-Stack Web Development',
    images: [
      MARKET_POST_THUMBNAILS.development,
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=75',
      'https://images.unsplash.com/photo-1461740680684-dccba630e2f6?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'May 8, 2026',
    categoryTags: ['Web Development', 'Freelance', 'React'],
    price: { kind: 'range', min: 100, max: 300 },
    fullDescription:
      'Let’s build your next project! I specialize in React, Next.js, Node.js, and Firebase. We can build anything from a simple landing page to a full-stack web app with authentication and database! Includes deployment to Vercel or Netlify.',
    hashtags: ['#webdev', '#react', '#nextjs', '#fullstack', '#freelance'],
    author: {
      fullName: 'Morgan H.',
      username: '@morganh',
      avatarUrl: avatar('morganh'),
      skills: ['React', 'Next.js', 'Node.js', 'Firebase'],
    },
  },
  '8': {
    id: '8',
    tag: 'Request',
    title: 'Seeking photography for graduation',
    images: [REQUEST_HERO, REQUEST_ALT],
    postedDate: 'May 19, 2026',
    categoryTags: ['Photography', 'Graduation', 'Campus'],
    price: { kind: 'negotiated' },
    fullDescription:
      'Graduating in June and need professional-looking photos for LinkedIn and family! Looking for a student photographer for a 1-hour session on campus near the quad and main buildings. Would like digital copies in full resolution.',
    hashtags: ['#photography', '#graduation', '#campus', '#portraits'],
    author: {
      fullName: 'Kevin B.',
      username: '@kevinb',
      avatarUrl: avatar('kevinb'),
    },
  },
  '9': {
    id: '9',
    tag: 'Request',
    title: 'Need help moving into off-campus apartment',
    images: [REQUEST_HERO, REQUEST_ALT],
    postedDate: 'May 18, 2026',
    categoryTags: ['Moving', 'Campus Life', 'Errands'],
    price: { kind: 'range', min: 15, max: 25 },
    fullDescription:
      'Looking for a few helpers to move boxes and furniture from my dorm to my new off-campus apartment this Saturday! Willing to pay per person/hour, with snacks and drinks provided! Bring a friend if you want — the more the merrier!',
    hashtags: ['#moving', '#errands', '#campusLife', '#helpWanted'],
    author: {
      fullName: 'Lisa C.',
      username: '@lisac',
      avatarUrl: avatar('lisac'),
    },
  },
  '10': {
    id: '10',
    tag: 'Request',
    title: 'Looking for study group for CS 101',
    images: [REQUEST_HERO],
    postedDate: 'May 17, 2026',
    categoryTags: ['Study Group', 'Computer Science', 'Midterms'],
    price: { kind: 'negotiated' },
    fullDescription:
      'Need peers to study with for upcoming CS 101 midterm! We can meet in the library 2-3 times a week, go over practice problems, and review lectures together! Beginners welcome — let’s learn together!',
    hashtags: ['#studyGroup', '#cs101', '#programming', '#midterms'],
    author: {
      fullName: 'Ryan T.',
      username: '@ryant',
      avatarUrl: avatar('ryant'),
    },
  },
  '11': {
    id: '11',
    tag: 'Request',
    title: 'Need someone to walk my dog on campus',
    images: [REQUEST_HERO, REQUEST_ALT],
    postedDate: 'May 16, 2026',
    categoryTags: ['Pets', 'Dog Walking', 'Campus Life'],
    price: { kind: 'fixed', amount: 20 },
    fullDescription:
      'Looking for a responsible student to walk my golden retriever, Charlie, twice a week near the campus quad! He’s super friendly and loves to play fetch! Walks are about 30-45 minutes, preferably in the afternoons!',
    hashtags: ['#dogWalking', '#pets', '#campusLife', '#errands'],
    author: {
      fullName: 'Nina W.',
      username: '@ninaw',
      avatarUrl: avatar('ninaw'),
    },
  },
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
  '2': {
    id: '2',
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
  'jp-req-1': {
    id: 'jp-req-1',
    tag: 'Request',
    title: 'Study partner for Linear Algebra final',
    images: [REQUEST_HERO],
    postedDate: 'Mar 19, 2026',
    categoryTags: ['Mathematics', 'Study Group', 'Finals'],
    price: { kind: 'negotiated' },
    fullDescription:
      'Looking for someone to review practice exams and problem sets twice a week before finals week. Prefer in-person sessions at the library.',
    hashtags: ['#linearAlgebra', '#studyGroup', '#finals'],
    author: {
      fullName: 'Jordan P.',
      username: '@jordanp',
      avatarUrl: avatar('jordanp'),
    },
  },
  'ct-req-1': {
    id: 'ct-req-1',
    tag: 'Request',
    title: 'Logo refresh for hackathon team',
    images: [REQUEST_HERO, REQUEST_ALT],
    postedDate: 'Mar 10, 2026',
    categoryTags: ['Branding', 'Design', 'Hackathon'],
    price: { kind: 'fixed', amount: 25 },
    fullDescription:
      'Need a simple wordmark and favicon set before our submission deadline next Friday. Open to minimalist or bold styles.',
    hashtags: ['#branding', '#logo', '#hackathon'],
    author: {
      fullName: 'Chris T.',
      username: '@christdev',
      avatarUrl: avatar('christdev'),
    },
  },
  'owner-svc-1': {
    id: 'owner-svc-1',
    tag: 'Service',
    title: 'Campus tutoring — math & physics',
    images: [
      MARKET_POST_THUMBNAILS.tutoring,
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'Jun 6, 2026',
    categoryTags: ['Tutoring', 'Mathematics', 'Physics'],
    price: { kind: 'range', min: 18, max: 28 },
    fullDescription:
      'One-on-one tutoring for intro calculus and physics. Sessions cover homework walkthroughs, concept reviews, and exam prep with flexible evening slots on campus or over Zoom.',
    hashtags: ['#tutoring', '#calculus', '#physics', '#campus'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
      skills: ['Calculus', 'Physics', 'STEM Tutoring'],
    },
  },
  'owner-svc-2': {
    id: 'owner-svc-2',
    tag: 'Service',
    title: 'Resume & cover letter review',
    images: [
      MARKET_POST_THUMBNAILS.editing,
      'https://images.unsplash.com/photo-1455390572672-7c6a028af77a?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'Jun 4, 2026',
    categoryTags: ['Career', 'Writing', 'Editing'],
    price: { kind: 'fixed', amount: 40 },
    fullDescription:
      'Detailed feedback on resume structure, bullet wording, and ATS-friendly formatting. Includes one revision round and quick turnaround before career fair week.',
    hashtags: ['#resume', '#careerFair', '#editing', '#jobSearch'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
      skills: ['Resume Writing', 'Career Coaching', 'Proofreading'],
    },
  },
  'owner-svc-3': {
    id: 'owner-svc-3',
    tag: 'Service',
    title: 'Club flyer & social media graphics',
    images: [
      MARKET_POST_THUMBNAILS.design,
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'Jun 2, 2026',
    categoryTags: ['Graphic Design', 'Student Orgs', 'Social Media'],
    price: { kind: 'range', min: 25, max: 45 },
    fullDescription:
      'Eye-catching flyers, Instagram story templates, and tabling banners for student organizations. Two revision rounds included with print-ready exports.',
    hashtags: ['#graphicDesign', '#studentOrgs', '#flyers', '#branding'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
      skills: ['Illustrator', 'Canva', 'Social Media Kits'],
    },
  },
  'owner-svc-4': {
    id: 'owner-svc-4',
    tag: 'Service',
    title: 'Intro Python homework help',
    images: [MARKET_POST_THUMBNAILS.bootcamp],
    postedDate: 'May 26, 2026',
    categoryTags: ['Programming', 'Python', 'Homework Help'],
    price: { kind: 'fixed', amount: 30 },
    fullDescription:
      'Walk through Python syntax, loops, functions, and small class projects. Ideal for students in their first CS course who want patient, peer-to-peer explanations.',
    hashtags: ['#python', '#homeworkHelp', '#cs101', '#coding'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
      skills: ['Python', 'Teaching', 'Debugging'],
    },
  },
  'owner-svc-5': {
    id: 'owner-svc-5',
    tag: 'Service',
    title: 'Dorm move-in & move-out hauling',
    images: [
      MARKET_POST_THUMBNAILS.laundry,
      'https://images.unsplash.com/photo-1582735689369-4fe89db71181?w=800&auto=format&fit=crop&q=75',
    ],
    postedDate: 'May 19, 2026',
    categoryTags: ['Errands', 'Campus Life', 'Moving'],
    price: { kind: 'negotiated' },
    fullDescription:
      'Help loading boxes, furniture, and mini-fridges between campus housing and nearby storage units. Available on weekends with a hand truck and tie-down straps.',
    hashtags: ['#moving', '#campusLife', '#errands', '#dorm'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
      skills: ['Reliability', 'Heavy Lifting', 'Campus Logistics'],
    },
  },
  'owner-req-1': {
    id: 'owner-req-1',
    tag: 'Request',
    title: 'Need help with portfolio website',
    images: [REQUEST_HERO, REQUEST_ALT],
    postedDate: 'Jun 2, 2026',
    categoryTags: ['Web Development', 'Portfolio', 'Career'],
    price: { kind: 'negotiated' },
    fullDescription:
      'Looking for a peer who can polish my personal site before career fair. Open to React, Next.js, or a clean static build with responsive layout and a project gallery.',
    hashtags: ['#portfolio', '#webdev', '#careerFair', '#react'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
    },
  },
  'owner-req-2': {
    id: 'owner-req-2',
    tag: 'Request',
    title: 'Study partner for organic chemistry midterm',
    images: [REQUEST_HERO],
    postedDate: 'Jun 5, 2026',
    categoryTags: ['Study Group', 'Chemistry', 'Midterms'],
    price: { kind: 'negotiated' },
    fullDescription:
      'Want to meet twice a week at the library to review mechanisms, nomenclature, and practice exams. Prefer in-person sessions with whiteboard work.',
    hashtags: ['#organicChemistry', '#studyGroup', '#midterm', '#campus'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
    },
  },
  'owner-req-3': {
    id: 'owner-req-3',
    tag: 'Request',
    title: 'Video editor for student org recap',
    images: [REQUEST_HERO, REQUEST_ALT],
    postedDate: 'Jun 3, 2026',
    categoryTags: ['Video Editing', 'Content Creation', 'Student Orgs'],
    price: { kind: 'range', min: 35, max: 55 },
    fullDescription:
      'Need clean cuts, captions, and light color grading for a 3-minute end-of-semester highlight reel. Footage is already organized; looking for a fast turnaround.',
    hashtags: ['#videoEditing', '#studentOrgs', '#premiere', '#recap'],
    author: {
      fullName: 'You',
      username: '@you',
      avatarUrl: avatar('owner'),
    },
  },
};
