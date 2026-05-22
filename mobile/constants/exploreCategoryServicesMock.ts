import type { ExploreCategoryId, ExploreCategoryService } from '../types/explore';

export const EXPLORE_CATEGORY_SERVICES_MOCK: Record<
  ExploreCategoryId,
  ExploreCategoryService[]
> = {
  tutoring: [
    {
      id: 'tutoring-1',
      categoryId: 'tutoring',
      title: 'STEM & Math Tutoring',
      description:
        'One-on-one help for calculus, linear algebra, physics, and exam review sessions.',
      filterTags: ['CALCULUS', 'LINEAR ALGEBRA', 'EXAM PREP'],
    },
    {
      id: 'tutoring-2',
      categoryId: 'tutoring',
      title: 'Writing & Essay Coaching',
      description:
        'Structure, clarity, and feedback on research papers, lab reports, and take-home essays.',
      filterTags: ['WRITING', 'ESSAYS', 'APA STYLE'],
    },
    {
      id: 'tutoring-3',
      categoryId: 'tutoring',
      title: 'Study Groups & Exam Prep',
      description:
        'Weekly study partners, practice tests, and last-minute review before midterms and finals.',
      filterTags: ['STUDY GROUPS', 'EXAM PREP', 'MIDTERMS'],
    },
  ],
  tech: [
    {
      id: 'tech-1',
      categoryId: 'tech',
      title: 'Website & App Development',
      description:
        'Landing pages, club sites, and mobile prototypes built with modern React and Expo stacks.',
      filterTags: ['REACT', 'EXPO', 'WEBSITES'],
    },
    {
      id: 'tech-2',
      categoryId: 'tech',
      title: 'Debugging & Code Review',
      description:
        'Pair programming, bug fixes, and architecture tips for class projects and hackathons.',
      filterTags: ['DEBUGGING', 'CODE REVIEW', 'PAIR PROGRAMMING'],
    },
    {
      id: 'tech-3',
      categoryId: 'tech',
      title: 'Portfolio & GitHub Setup',
      description:
        'Polish your developer portfolio, README files, and deployment workflow before recruiting season.',
      filterTags: ['PORTFOLIO', 'GITHUB', 'DEPLOYMENT'],
    },
  ],
  design: [
    {
      id: 'design-1',
      categoryId: 'design',
      title: 'Event Posters & Flyers',
      description:
        'Bold visuals for club meetings, fundraisers, and campus events with fast turnaround.',
      filterTags: ['POSTERS', 'FLYERS', 'EVENTS'],
    },
    {
      id: 'design-2',
      categoryId: 'design',
      title: 'UI Mockups & Prototypes',
      description:
        'Figma screens and clickable flows for apps, pitch decks, and class design assignments.',
      filterTags: ['FIGMA', 'UI DESIGN', 'PROTOTYPES'],
    },
    {
      id: 'design-3',
      categoryId: 'design',
      title: 'Brand & Social Kits',
      description:
        'Logos, color palettes, and Instagram-ready templates for student orgs and side projects.',
      filterTags: ['BRANDING', 'SOCIAL MEDIA', 'LOGOS'],
    },
  ],
  career: [
    {
      id: 'career-1',
      categoryId: 'career',
      title: 'Resume & CV Review',
      description:
        'Tailored edits for internships, research roles, and your first full-time applications.',
      filterTags: ['RESUMES', 'CV', 'INTERNSHIPS'],
    },
    {
      id: 'career-2',
      categoryId: 'career',
      title: 'Interview Prep & Mock Sessions',
      description:
        'Behavioral questions, technical screens, and confidence coaching before big interviews.',
      filterTags: ['INTERVIEWS', 'MOCK SESSIONS', 'BEHAVIORAL'],
    },
    {
      id: 'career-3',
      categoryId: 'career',
      title: 'LinkedIn & Personal Statements',
      description:
        'Headline polish, summary rewrites, and grad-school or scholarship essay feedback.',
      filterTags: ['LINKEDIN', 'ESSAYS', 'SCHOLARSHIPS'],
    },
  ],
  campus: [
    {
      id: 'campus-1',
      categoryId: 'campus',
      title: 'Laundry & Pickup Runs',
      description:
        'Reliable wash-and-fold or dorm pickup when your week is packed with classes.',
      filterTags: ['LAUNDRY', 'PICKUP', 'WASH-AND-FOLD'],
    },
    {
      id: 'campus-2',
      categoryId: 'campus',
      title: 'Moving & Heavy Lifting',
      description:
        'Help hauling boxes, furniture, and gear during move-in, move-out, or room swaps.',
      filterTags: ['MOVING', 'LIFTING', 'MOVE-IN'],
    },
    {
      id: 'campus-3',
      categoryId: 'campus',
      title: 'Errands & Delivery',
      description:
        'Textbooks, groceries, and packages brought to your door anywhere on campus.',
      filterTags: ['DELIVERY', 'ERRANDS', 'GROCERIES'],
    },
  ],
};
