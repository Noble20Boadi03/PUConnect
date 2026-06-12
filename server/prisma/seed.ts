import { PrismaClient, ExploreCategoryId } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Categories
  const categories = [
    {
      id: ExploreCategoryId.tutoring,
      title: 'Tutoring',
      pillLabel: 'Tutoring',
      tagline: 'Study smarter together',
      description: 'One-on-one help for your toughest classes, exam prep, and study groups.',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
      accentColor: '#3B82F6',
      iconName: 'tutoring',
    },
    {
      id: ExploreCategoryId.tech,
      title: 'Tech & Coding',
      pillLabel: 'Tech',
      tagline: 'Build amazing things',
      description: 'Websites, apps, debugging, portfolio help, and more for your tech projects.',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
      accentColor: '#8B5CF6',
      iconName: 'tech',
    },
    {
      id: ExploreCategoryId.design,
      title: 'Design & Creative',
      pillLabel: 'Design',
      tagline: 'Make it beautiful',
      description: 'Posters, UI/UX, branding, social media, and all things creative.',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      accentColor: '#EC4899',
      iconName: 'design',
    },
    {
      id: ExploreCategoryId.career,
      title: 'Career & Professional',
      pillLabel: 'Career',
      tagline: 'Level up your future',
      description: 'Resumes, interviews, LinkedIn, and grad school application help.',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      accentColor: '#10B981',
      iconName: 'career',
    },
    {
      id: ExploreCategoryId.campus,
      title: 'Campus Life',
      pillLabel: 'Campus',
      tagline: 'Campus made easy',
      description: 'Laundry, moving help, errands, and all the campus tasks you need a hand with.',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
      accentColor: '#F59E0B',
      iconName: 'campus',
    },
  ];

  console.log('📚 Creating categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  // 2. Create Category Services
  const categoryServices = [
    // Tutoring
    {
      categoryId: ExploreCategoryId.tutoring,
      title: 'STEM & Math Tutoring',
      description: 'One-on-one help for calculus, linear algebra, physics, and exam review sessions.',
      filterTags: ['CALCULUS', 'LINEAR ALGEBRA', 'EXAM PREP'],
    },
    {
      categoryId: ExploreCategoryId.tutoring,
      title: 'Writing & Essay Coaching',
      description: 'Structure, clarity, and feedback on research papers, lab reports, and take-home essays.',
      filterTags: ['WRITING', 'ESSAYS', 'APA STYLE'],
    },
    {
      categoryId: ExploreCategoryId.tutoring,
      title: 'Study Groups & Exam Prep',
      description: 'Weekly study partners, practice tests, and last-minute review before midterms and finals.',
      filterTags: ['STUDY GROUPS', 'EXAM PREP', 'MIDTERMS'],
    },
    // Tech
    {
      categoryId: ExploreCategoryId.tech,
      title: 'Website & App Development',
      description: 'Landing pages, club sites, and mobile prototypes built with modern React and Expo stacks.',
      filterTags: ['REACT', 'EXPO', 'WEBSITES'],
    },
    {
      categoryId: ExploreCategoryId.tech,
      title: 'Debugging & Code Review',
      description: 'Pair programming, bug fixes, and architecture tips for class projects and hackathons.',
      filterTags: ['DEBUGGING', 'CODE REVIEW', 'PAIR PROGRAMMING'],
    },
    {
      categoryId: ExploreCategoryId.tech,
      title: 'Portfolio & GitHub Setup',
      description: 'Polish your developer portfolio, README files, and deployment workflow before recruiting season.',
      filterTags: ['PORTFOLIO', 'GITHUB', 'DEPLOYMENT'],
    },
    // Design
    {
      categoryId: ExploreCategoryId.design,
      title: 'Event Posters & Flyers',
      description: 'Bold visuals for club meetings, fundraisers, and campus events with fast turnaround.',
      filterTags: ['POSTERS', 'FLYERS', 'EVENTS'],
    },
    {
      categoryId: ExploreCategoryId.design,
      title: 'UI Mockups & Prototypes',
      description: 'Figma screens and clickable flows for apps, pitch decks, and class design assignments.',
      filterTags: ['FIGMA', 'UI DESIGN', 'PROTOTYPES'],
    },
    {
      categoryId: ExploreCategoryId.design,
      title: 'Brand & Social Kits',
      description: 'Logos, color palettes, and Instagram-ready templates for student orgs and side projects.',
      filterTags: ['BRANDING', 'SOCIAL MEDIA', 'LOGOS'],
    },
    // Career
    {
      categoryId: ExploreCategoryId.career,
      title: 'Resume & CV Review',
      description: 'Tailored edits for internships, research roles, and your first full-time applications.',
      filterTags: ['RESUMES', 'CV', 'INTERNSHIPS'],
    },
    {
      categoryId: ExploreCategoryId.career,
      title: 'Interview Prep & Mock Sessions',
      description: 'Behavioral questions, technical screens, and confidence coaching before big interviews.',
      filterTags: ['INTERVIEWS', 'MOCK SESSIONS', 'BEHAVIORAL'],
    },
    {
      categoryId: ExploreCategoryId.career,
      title: 'LinkedIn & Personal Statements',
      description: 'Headline polish, summary rewrites, and grad-school or scholarship essay feedback.',
      filterTags: ['LINKEDIN', 'ESSAYS', 'SCHOLARSHIPS'],
    },
    // Campus
    {
      categoryId: ExploreCategoryId.campus,
      title: 'Laundry & Pickup Runs',
      description: 'Reliable wash-and-fold or dorm pickup when your week is packed with classes.',
      filterTags: ['LAUNDRY', 'PICKUP', 'WASH-AND-FOLD'],
    },
    {
      categoryId: ExploreCategoryId.campus,
      title: 'Moving & Heavy Lifting',
      description: 'Help hauling boxes, furniture, and gear during move-in, move-out, or room swaps.',
      filterTags: ['MOVING', 'LIFTING', 'MOVE-IN'],
    },
    {
      categoryId: ExploreCategoryId.campus,
      title: 'Errands & Delivery',
      description: 'Textbooks, groceries, and packages brought to your door anywhere on campus.',
      filterTags: ['DELIVERY', 'ERRANDS', 'GROCERIES'],
    },
  ];

  console.log('🛠️ Creating category services...');
  await prisma.categoryService.deleteMany({}); // Clear existing to avoid duplicates
  for (const service of categoryServices) {
    await prisma.categoryService.create({
      data: service,
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
