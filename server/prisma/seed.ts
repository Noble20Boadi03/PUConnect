import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── CLEANUP ────────────────────────────────────────────────────────────────
  await prisma.adminActionLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.report.deleteMany();
  await prisma.pinnedConversation.deleteMany();
  await prisma.mutedConversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.post.deleteMany();
  await prisma.categoryService.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ Cleaned existing data');

  // ── 1. CATEGORIES ──────────────────────────────────────────────────────────
  await prisma.category.createMany({
    data: [
      {
        id: 'academics',
        title: 'Academics & Languages',
        pillLabel: 'Academics',
        tagline: 'Learn, translate, and study smarter',
        description: 'Subject tutoring, study groups, and translation services for campus life.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-academics/240/240',
        accentColor: '#7C3AED',
        iconName: 'school-outline',
      },
      {
        id: 'tech_creative',
        title: 'Tech & Creative',
        pillLabel: 'Tech',
        tagline: 'Build, debug, and ship with peers',
        description: 'Web and app development, software engineering support, and IT troubleshooting.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-tech/240/240',
        accentColor: '#2563EB',
        iconName: 'code-slash-outline',
      },
      {
        id: 'media',
        title: 'Media',
        pillLabel: 'Media',
        tagline: 'Capture, edit, and design your story',
        description: 'Event photography, video editing, and graphic design for every campus moment.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-media/240/240',
        accentColor: '#EA580C',
        iconName: 'camera-outline',
      },
      {
        id: 'business_career',
        title: 'Business & Career',
        pillLabel: 'Career',
        tagline: 'Stand out before graduation day',
        description: 'CV writing, career coaching, internship support, and LinkedIn optimization.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-career/240/240',
        accentColor: '#059669',
        iconName: 'briefcase-outline',
      },
      {
        id: 'campus_lifestyle',
        title: 'Campus & Lifestyle',
        pillLabel: 'Campus',
        tagline: 'Everything else that keeps campus life running',
        description: 'Deliveries, equipment rentals, and beauty & personal care on campus.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-campus/240/240',
        accentColor: '#DB2777',
        iconName: 'bicycle-outline',
      },
    ],
  });
  console.log('✅ Categories seeded');

  // ── 2. CATEGORY SERVICES ───────────────────────────────────────────────────
  await prisma.categoryService.createMany({
    data: [
      // Academics
      {
        id: 'academics-tutoring',
        categoryId: 'academics',
        title: 'Subject Tutoring',
        description: 'One-on-one tutoring across core subjects.',
        filterTags: ['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'History'].map(t => t.toUpperCase()),
      },
      {
        id: 'academics-translation',
        categoryId: 'academics',
        title: 'Translation',
        description: 'Document and spoken translation.',
        filterTags: ['Twi', 'English', 'French', 'Spanish'].map(t => t.toUpperCase()),
      },

      // Tech & Creative
      {
        id: 'tech-web-app-dev',
        categoryId: 'tech_creative',
        title: 'Website & App Development',
        description: 'Build landing pages, portfolios, e-commerce stores, and more.',
        filterTags: ['Landing Page', 'Portfolio', 'E-commerce', 'Mobile App', 'Full Stack', 'Deployment & Analytics'].map(t => t.toUpperCase()),
      },
      {
        id: 'tech-software-eng',
        categoryId: 'tech_creative',
        title: 'Software Engineering Support',
        description: 'Code reviews, debugging, tutoring, and architecture design.',
        filterTags: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C', 'Go', 'SQL', 'Code Review', 'Debugging', 'Tutoring', 'Architecture Design'].map(t => t.toUpperCase()),
      },
      {
        id: 'tech-it-support',
        categoryId: 'tech_creative',
        title: 'IT Support & Troubleshooting',
        description: 'Hardware and software support.',
        filterTags: ['Mac', 'Windows', 'Hardware', 'Software'].map(t => t.toUpperCase()),
      },

      // Media
      {
        id: 'media-photography-video',
        categoryId: 'media',
        title: 'Event Photography/Videography',
        description: 'Professional coverage for campus events.',
        filterTags: ['Birthday', 'Graduation', 'Conference', 'Sports', 'Party'].map(t => t.toUpperCase()),
      },
      {
        id: 'media-video-editing',
        categoryId: 'media',
        title: 'Video Editing',
        description: 'Editing for YouTube, TikTok, documentaries, and more.',
        filterTags: ['YouTube', 'TikTok', 'Documentary', 'Podcast'].map(t => t.toUpperCase()),
      },
      {
        id: 'media-graphic-design',
        categoryId: 'media',
        title: 'Graphic Design',
        description: 'Logos, flyers, full brand kits, and UI/UX mockups.',
        filterTags: ['Logo', 'Flyer', 'Branding', 'UI/UX'].map(t => t.toUpperCase()),
      },

      // Business & Career
      {
        id: 'career-cv',
        categoryId: 'business_career',
        title: 'CV & Cover Letter',
        description: 'Professional CV writing and cover letter crafting.',
        filterTags: [],
      },
      {
        id: 'career-support',
        categoryId: 'business_career',
        title: 'Career/Internship Support',
        description: 'Interview prep, application strategy, and industry guidance.',
        filterTags: [],
      },
      {
        id: 'career-linkedin',
        categoryId: 'business_career',
        title: 'LinkedIn Optimization',
        description: 'Headline rewrites, summary polish, and profile audits.',
        filterTags: [],
      },

      // Campus & Lifestyle
      {
        id: 'campus-delivery',
        categoryId: 'campus_lifestyle',
        title: 'Delivery',
        description: 'On-campus delivery for food, groceries, and packages.',
        filterTags: [],
      },
      {
        id: 'campus-rentals',
        categoryId: 'campus_lifestyle',
        title: 'Equipment Rentals',
        description: 'Short-term rental of various equipment.',
        filterTags: ['Projectors & Screens', 'Musical Instruments', 'Engineering Lab Kits', 'Cameras', 'Gaming Equipment'].map(t => t.toUpperCase()),
      },
      {
        id: 'campus-beauty',
        categoryId: 'campus_lifestyle',
        title: 'Beauty & Personal Care',
        description: 'On-campus beauty and personal care services.',
        filterTags: ['Nails', 'Barbering', 'Braiding', 'Makeup'].map(t => t.toUpperCase()),
      },
    ],
  });
  console.log('✅ Category services seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
