import {
  PrismaClient,
  UserRole,
  ExploreCategoryId,
  NotificationKind,
  MessageKind,
  ServiceRequestStatus,
  ServiceRequestKind,
  PostStatus,
  UserStatus,
  ReportStatus,
  ReportTargetType,
  ReportReason,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AVATAR = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;
const UNSPLASH = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);

const fixed = (amount: number) => ({ kind: 'fixed' as const, amount });
const range = (min: number, max: number) => ({ kind: 'range' as const, min, max });
const negotiated = () => ({ kind: 'negotiated' as const });

const POST_IMAGES = {
  academics: [
    UNSPLASH('photo-1522202176988-66273c2fd55f'),
    UNSPLASH('photo-1434030216411-0b793f4b4173'),
    UNSPLASH('photo-1513258496099-48168024aec0'),
  ],
  tech_creative: [
    UNSPLASH('photo-1461749280684-dccba630e2f6'),
    UNSPLASH('photo-1498050108023-c5249f4df085'),
    UNSPLASH('photo-1555066931-4365d14bab8c'),
  ],
  media: [
    UNSPLASH('photo-1561070791-2526d30994b5'),
    UNSPLASH('photo-1572044162444-ad60f128bdea'),
    UNSPLASH('photo-1600132806370-bf17e65e942f'),
  ],
  business_career: [
    UNSPLASH('photo-1486312338219-ce68d2c6f44d'),
    UNSPLASH('photo-1454165804606-c3d57bc86b40'),
    UNSPLASH('photo-1507003211169-0a1dd7228f2d'),
  ],
  campus_lifestyle: [
    UNSPLASH('photo-1523050854058-8df90110c9f1'),
    UNSPLASH('photo-1541339907198-e08756dedf3f'),
    UNSPLASH('photo-1519389950473-47ba0277781c'),
  ],
};

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
        title: 'Academics & Language',
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
        description: 'CV writing, career coaching, internship support, and LinkedIn optimisation.',
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
      {
        id: 'academics-tutoring',
        categoryId: 'academics',
        title: 'Subject Tutoring',
        description: 'One-on-one tutoring across core subjects. Filter by subject to find the right match.',
        filterTags: ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'COMPUTER SCIENCE', 'LITERATURE', 'HISTORY'],
      },
      {
        id: 'academics-study-group',
        categoryId: 'academics',
        title: 'Study Group',
        description: 'Join or form study groups by subject and group size for collaborative learning.',
        filterTags: ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'COMPUTER SCIENCE', 'LITERATURE', 'HISTORY', 'SMALL GROUP', 'LARGE GROUP'],
      },
      {
        id: 'academics-translation',
        categoryId: 'academics',
        title: 'Translation',
        description: 'Document and spoken translation across common campus language pairs.',
        filterTags: ['TWI-ENGLISH', 'ENGLISH-FRENCH', 'ENGLISH-SPANISH', 'FRENCH-SPANISH'],
      },
      {
        id: 'tech-web-app-dev',
        categoryId: 'tech_creative',
        title: 'Website & App Development',
        description: 'Build landing pages, portfolios, e-commerce stores, mobile apps, and full-stack projects.',
        filterTags: ['LANDING PAGE', 'PORTFOLIO', 'E-COMMERCE', 'MOBILE APP', 'FULL STACK', 'DEPLOYMENT & ANALYTICS'],
      },
      {
        id: 'tech-software-eng',
        categoryId: 'tech_creative',
        title: 'Software Engineering Support',
        description: 'Code reviews, debugging, tutoring, and architecture design across major languages.',
        filterTags: ['PYTHON', 'JAVA', 'JAVASCRIPT', 'TYPESCRIPT', 'C++', 'C', 'GO', 'SQL', 'CODE REVIEW', 'DEBUGGING', 'TUTORING', 'ARCHITECTURE DESIGN'],
      },
      {
        id: 'tech-it-support',
        categoryId: 'tech_creative',
        title: 'IT Support & Troubleshooting',
        description: 'Hardware and software support for Mac and Windows devices.',
        filterTags: ['MAC', 'WINDOWS', 'HARDWARE', 'SOFTWARE'],
      },
      {
        id: 'media-photography',
        categoryId: 'media',
        title: 'Event Photography & Video',
        description: 'Professional coverage for birthdays, graduations, conferences, sports events, and parties.',
        filterTags: ['BIRTHDAY', 'GRADUATION', 'CONFERENCE', 'SPORTS', 'PARTY'],
      },
      {
        id: 'media-video-editing',
        categoryId: 'media',
        title: 'Video Editing',
        description: 'Editing for YouTube content, TikTok, documentaries, and podcasts.',
        filterTags: ['YOUTUBE', 'TIKTOK', 'DOCUMENTARY', 'PODCAST'],
      },
      {
        id: 'media-graphic-design',
        categoryId: 'media',
        title: 'Graphic Design',
        description: 'Logos, flyers, full brand kits, and UI/UX mockups for any campus need.',
        filterTags: ['LOGO', 'FLYER', 'BRANDING', 'UI/UX'],
      },
      {
        id: 'career-cv',
        categoryId: 'business_career',
        title: 'CV & Cover Letter',
        description: 'Professional CV writing and cover letter crafting tailored to your target roles.',
        filterTags: ['CV WRITING', 'COVER LETTER', 'INTERNSHIP', 'GRADUATE ROLES'],
      },
      {
        id: 'career-support',
        categoryId: 'business_career',
        title: 'Career & Internship Support',
        description: 'Interview prep, mock sessions, application strategy, and industry guidance.',
        filterTags: ['INTERVIEW PREP', 'MOCK INTERVIEW', 'APPLICATION STRATEGY', 'INDUSTRY GUIDANCE'],
      },
      {
        id: 'career-linkedin',
        categoryId: 'business_career',
        title: 'LinkedIn Optimisation',
        description: 'Headline rewrites, summary polish, and profile audits to attract recruiters.',
        filterTags: ['PROFILE AUDIT', 'HEADLINE', 'SUMMARY', 'RECRUITER VISIBILITY'],
      },
      {
        id: 'campus-delivery',
        categoryId: 'campus_lifestyle',
        title: 'Delivery',
        description: 'Same-day on-campus delivery for food, groceries, textbooks, and packages.',
        filterTags: ['FOOD', 'GROCERIES', 'TEXTBOOKS', 'PACKAGES'],
      },
      {
        id: 'campus-rentals',
        categoryId: 'campus_lifestyle',
        title: 'Equipment Rentals',
        description: 'Short-term rental of projectors, instruments, lab kits, cameras, and gaming gear.',
        filterTags: ['PROJECTORS & SCREENS', 'MUSICAL INSTRUMENTS', 'ENGINEERING LAB KITS', 'CAMERAS', 'GAMING EQUIPMENT'],
      },
      {
        id: 'campus-beauty',
        categoryId: 'campus_lifestyle',
        title: 'Beauty & Personal Care',
        description: 'On-campus nail care, barbering, braiding, and makeup services.',
        filterTags: ['NAILS', 'BARBERING', 'BRAIDING', 'MAKEUP'],
      },
    ],
  });
  console.log('✅ Category services seeded');

  // ── 3. USERS ───────────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@puconnect.app',
      username: 'puadmin',
      password: hash('Admin1234!'),
      role: UserRole.admin,
      avatarUrl: AVATAR('puadmin'),
      bio: 'Platform administrator.',
      expertiseTags: [],
      serviceIds: [],
      lastLoginAt: daysAgo(1),
    },
  });

  const testUser = await prisma.user.create({
    data: {
      name: 'Alex Mensah',
      email: 'alex@puconnect.app',
      username: 'alexmensah',
      password: hash('Test1234!'),
      role: UserRole.user,
      avatarUrl: AVATAR('alexmensah'),
      bio: 'Computer Science student. Love building apps and solving problems.',
      categoryId: ExploreCategoryId.tech_creative,
      skillTitle: 'Full Stack Developer',
      expertiseTags: ['React Native', 'Node.js', 'TypeScript'],
      serviceIds: ['tech-web-app-dev', 'tech-software-eng'],
      lastLoginAt: hoursAgo(2),
    },
  });

  const ama = await prisma.user.create({
    data: {
      name: 'Ama Owusu',
      email: 'ama@puconnect.app',
      username: 'amaowusu',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('amaowusu'),
      bio: 'Media student specialising in graphic design and photography. 3 years of freelance experience.',
      categoryId: ExploreCategoryId.media,
      skillTitle: 'Graphic Designer & Photographer',
      expertiseTags: ['Logo Design', 'Event Photography', 'Branding'],
      serviceIds: ['media-graphic-design', 'media-photography'],
      lastLoginAt: daysAgo(1),
    },
  });

  const kwame = await prisma.user.create({
    data: {
      name: 'Kwame Asante',
      email: 'kwame@puconnect.app',
      username: 'kwameasante',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('kwameasante'),
      bio: 'Mathematics & Statistics tutor. Helped 50+ students pass their exams.',
      categoryId: ExploreCategoryId.academics,
      skillTitle: 'STEM Tutor',
      expertiseTags: ['Math', 'Physics', 'Exam Prep'],
      serviceIds: ['academics-tutoring', 'academics-study-group'],
      lastLoginAt: daysAgo(2),
    },
  });

  const abena = await prisma.user.create({
    data: {
      name: 'Abena Frimpong',
      email: 'abena@puconnect.app',
      username: 'abenafrimpong',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('abenafrimpong'),
      bio: 'Career counsellor and CV coach. Former HR intern at a top firm.',
      categoryId: ExploreCategoryId.business_career,
      skillTitle: 'Career Coach',
      expertiseTags: ['CV Writing', 'Interview Prep', 'LinkedIn'],
      serviceIds: ['career-cv', 'career-support', 'career-linkedin'],
      lastLoginAt: daysAgo(3),
    },
  });

  const kofi = await prisma.user.create({
    data: {
      name: 'Kofi Boateng',
      email: 'kofi@puconnect.app',
      username: 'kofiboateng',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('kofiboateng'),
      bio: 'Campus delivery and rentals guy. Fast, reliable, and always on time.',
      categoryId: ExploreCategoryId.campus_lifestyle,
      skillTitle: 'Campus Assistant',
      expertiseTags: ['Delivery', 'Equipment Rentals', 'Campus Errands'],
      serviceIds: ['campus-delivery', 'campus-rentals'],
      lastLoginAt: daysAgo(1),
    },
  });

  const efua = await prisma.user.create({
    data: {
      name: 'Efua Darkwa',
      email: 'efua@puconnect.app',
      username: 'efuadarkwa',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('efuadarkwa'),
      bio: 'Software dev and hackathon winner. I help students debug and ship faster.',
      categoryId: ExploreCategoryId.tech_creative,
      skillTitle: 'Software Developer',
      expertiseTags: ['Debugging', 'Python', 'JavaScript'],
      serviceIds: ['tech-software-eng', 'tech-web-app-dev'],
      lastLoginAt: daysAgo(4),
    },
  });

  const yaw = await prisma.user.create({
    data: {
      name: 'Yaw Darko',
      email: 'yaw@puconnect.app',
      username: 'yawdarko',
      password: hash('Test1234!'),
      role: UserRole.user,
      avatarUrl: AVATAR('yawdarko'),
      bio: 'Business student looking for affordable campus services.',
      expertiseTags: [],
      serviceIds: [],
      lastLoginAt: daysAgo(5),
    },
  });

  const nana = await prisma.user.create({
    data: {
      name: 'Nana Adjei',
      email: 'nana@puconnect.app',
      username: 'nanaadjei',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('nanaadjei'),
      bio: 'Film student and video editor. I turn raw footage into polished stories for campus orgs.',
      categoryId: ExploreCategoryId.media,
      skillTitle: 'Video Editor',
      expertiseTags: ['Premiere Pro', 'YouTube', 'Documentary'],
      serviceIds: ['media-video-editing', 'media-photography'],
      lastLoginAt: daysAgo(6),
    },
  });

  const joe = await prisma.user.create({
    data: {
      name: 'Joe Mensah',
      email: 'joe@puconnect.app',
      username: 'joemensah',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('joemensah'),
      bio: 'Trilingual student offering academic translation and proofreading in English, French, and Twi.',
      categoryId: ExploreCategoryId.academics,
      skillTitle: 'Translator & Proofreader',
      expertiseTags: ['French', 'Twi', 'Academic Writing'],
      serviceIds: ['academics-translation'],
      lastLoginAt: daysAgo(7),
    },
  });

  const akosua = await prisma.user.create({
    data: {
      name: 'Akosua Yeboah',
      email: 'akosua@puconnect.app',
      username: 'akosuayeboah',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('akosuayeboah'),
      bio: 'On-campus beauty services — braiding, nails, and makeup for events and everyday looks.',
      categoryId: ExploreCategoryId.campus_lifestyle,
      skillTitle: 'Beauty Stylist',
      expertiseTags: ['Braiding', 'Makeup', 'Nails'],
      serviceIds: ['campus-beauty'],
      lastLoginAt: daysAgo(8),
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: 'Marcus Osei',
      email: 'marcus@puconnect.app',
      username: 'marcusosei',
      password: hash('Test1234!'),
      role: UserRole.user,
      status: UserStatus.suspended,
      avatarUrl: AVATAR('marcusosei'),
      bio: 'Account under review.',
      expertiseTags: [],
      serviceIds: [],
      lastLoginAt: daysAgo(45),
    },
  });

  console.log('✅ Users seeded');

  // ── 4. PROVIDER SERVICES ───────────────────────────────────────────────────
  await prisma.providerService.createMany({
    data: [
      { userId: kwame.id, categoryId: 'academics', title: 'One-on-One Math Tutoring', description: 'Weekly sessions covering calculus, algebra, and statistics. Exam rescue available.', price: fixed(30), tags: ['MATH', 'CALCULUS', 'EXAM PREP'] },
      { userId: kwame.id, categoryId: 'academics', title: 'Physics Study Group', description: 'Small group sessions (2–5 students) for mechanics, waves, and electromagnetism.', price: range(15, 25), tags: ['PHYSICS', 'SMALL GROUP'] },
      { userId: abena.id, categoryId: 'business_career', title: 'CV & Cover Letter Writing', description: 'Full CV rewrite with tailored cover letter for your target internship or graduate role.', price: fixed(40), tags: ['CV WRITING', 'COVER LETTER', 'INTERNSHIP'] },
      { userId: abena.id, categoryId: 'business_career', title: 'Mock Interview Session', description: '60-minute session with real-world behavioural and technical questions plus feedback.', price: fixed(35), tags: ['MOCK INTERVIEW', 'INTERVIEW PREP'] },
      { userId: abena.id, categoryId: 'business_career', title: 'LinkedIn Profile Optimisation', description: 'Headline, summary, and profile audit to make you visible to recruiters.', price: fixed(25), tags: ['PROFILE AUDIT', 'HEADLINE', 'RECRUITER VISIBILITY'] },
      { userId: ama.id, categoryId: 'media', title: 'Event Photography', description: 'Coverage for birthdays, graduations, and campus events. Edited photos delivered in 48hrs.', price: fixed(80), tags: ['BIRTHDAY', 'GRADUATION', 'PARTY'] },
      { userId: ama.id, categoryId: 'media', title: 'Logo & Brand Design', description: 'Logo, colour palette, and social media kit for student orgs and side projects.', price: fixed(70), tags: ['LOGO', 'BRANDING', 'UI/UX'] },
      { userId: ama.id, categoryId: 'media', title: 'Flyer & Poster Design', description: 'Bold print-ready designs for campus events. 48-hour turnaround guaranteed.', price: fixed(30), tags: ['FLYER', 'BRANDING'] },
      { userId: kofi.id, categoryId: 'campus_lifestyle', title: 'Same-Day Campus Delivery', description: 'Food, groceries, textbooks, or packages delivered anywhere on campus.', price: fixed(15), tags: ['FOOD', 'GROCERIES', 'TEXTBOOKS', 'PACKAGES'] },
      { userId: kofi.id, categoryId: 'campus_lifestyle', title: 'Equipment Rental', description: 'Short-term rental of projectors, cameras, and engineering lab kits.', price: range(15, 30), tags: ['PROJECTORS & SCREENS', 'CAMERAS', 'ENGINEERING LAB KITS'] },
      { userId: efua.id, categoryId: 'tech_creative', title: 'Code Debugging & Review', description: 'Live pair programming to find and fix bugs. Supports Python, JS, TS, Java, and more.', price: fixed(35), tags: ['DEBUGGING', 'CODE REVIEW', 'PYTHON', 'JAVASCRIPT'] },
      { userId: efua.id, categoryId: 'tech_creative', title: 'Portfolio & GitHub Setup', description: 'Polish your GitHub profile, write proper READMEs, and deploy your portfolio site.', price: fixed(60), tags: ['PORTFOLIO', 'DEPLOYMENT & ANALYTICS'] },
      { userId: nana.id, categoryId: 'media', title: 'YouTube & TikTok Editing', description: 'Fast-turnaround edits for campus content creators. Colour grading and captions included.', price: fixed(45), tags: ['YOUTUBE', 'TIKTOK', 'PODCAST'] },
      { userId: nana.id, categoryId: 'media', title: 'Documentary Short Edit', description: 'Story-driven edits for student film projects and society recap videos.', price: range(60, 120), tags: ['DOCUMENTARY', 'PODCAST'] },
      { userId: joe.id, categoryId: 'academics', title: 'French ↔ English Translation', description: 'Accurate academic translation for research papers, theses, and journal articles.', price: fixed(35), tags: ['ENGLISH-FRENCH', 'FRENCH-SPANISH'] },
      { userId: joe.id, categoryId: 'academics', title: 'Twi ↔ English Translation', description: 'Document and spoken translation for campus forms, presentations, and interviews.', price: fixed(30), tags: ['TWI-ENGLISH'] },
      { userId: akosua.id, categoryId: 'campus_lifestyle', title: 'Event Braiding & Makeup', description: 'Graduation and party-ready looks. Mobile service anywhere on campus.', price: fixed(40), tags: ['BRAIDING', 'MAKEUP'] },
      { userId: akosua.id, categoryId: 'campus_lifestyle', title: 'Nail Art & Manicure', description: 'Custom nail designs for events or weekly upkeep. All materials provided.', price: fixed(25), tags: ['NAILS'] },
    ],
  });
  console.log('✅ Provider services seeded');

  // ── 5. POSTS ───────────────────────────────────────────────────────────────
  const posts = await Promise.all([
    // Service posts
    prisma.post.create({ data: { title: 'One-on-One Math & Calculus Tutoring', description: 'Struggling with derivatives, integrals, or limits? I have helped 50+ students pass. Flexible scheduling including weekends before exams.', tag: 'Service', price: fixed(30), images: [POST_IMAGES.academics[0]], hashtags: ['math', 'calculus', 'tutoring'], helpCategoryIds: ['academics-tutoring'], authorId: kwame.id } }),
    prisma.post.create({ data: { title: 'CV & Cover Letter Writing', description: 'Former HR intern here. Full CV rewrite and tailored cover letter for your target role. Delivered within 24 hours with tracked edits.', tag: 'Service', price: fixed(40), images: [POST_IMAGES.business_career[0]], hashtags: ['cv', 'career', 'internship'], helpCategoryIds: ['career-cv'], authorId: abena.id } }),
    prisma.post.create({ data: { title: 'Event Photography — Birthdays & Graduations', description: 'Professional event coverage with edited photos delivered in 48hrs. Available for birthdays, graduations, conferences, and parties.', tag: 'Service', price: fixed(80), images: [POST_IMAGES.media[0]], hashtags: ['photography', 'events', 'graduation'], helpCategoryIds: ['media-photography'], authorId: ama.id } }),
    prisma.post.create({ data: { title: 'Same-Day Campus Delivery', description: 'Need groceries, a textbook from the library, or a package picked up? Fast same-day delivery anywhere on campus.', tag: 'Service', price: fixed(15), images: [POST_IMAGES.campus_lifestyle[0]], hashtags: ['delivery', 'campus', 'errands'], helpCategoryIds: ['campus-delivery'], authorId: kofi.id } }),
    prisma.post.create({ data: { title: 'Code Debugging & Pair Programming', description: 'Stuck on a bug or need a second pair of eyes? I specialise in Python, JavaScript, and TypeScript. Live sessions available.', tag: 'Service', price: fixed(35), images: [POST_IMAGES.tech_creative[0]], hashtags: ['debugging', 'python', 'javascript'], helpCategoryIds: ['tech-software-eng'], authorId: efua.id } }),
    prisma.post.create({ data: { title: 'Logo & Brand Kit Design', description: 'Complete brand identity: logo, colour palette, and social media templates. Perfect for student orgs. 3 revisions included.', tag: 'Service', price: fixed(70), images: [POST_IMAGES.media[1]], hashtags: ['logo', 'branding', 'design'], helpCategoryIds: ['media-graphic-design'], authorId: ama.id } }),
    prisma.post.create({ data: { title: 'LinkedIn Profile Optimisation', description: 'Headline rewrite, summary polish, and full profile audit. Recruiters will notice the difference before your next application round.', tag: 'Service', price: fixed(25), images: [POST_IMAGES.business_career[1]], hashtags: ['linkedin', 'career', 'recruiting'], helpCategoryIds: ['career-linkedin'], authorId: abena.id } }),
    prisma.post.create({ data: { title: 'Portfolio & GitHub Polish', description: 'Clean GitHub profile, proper READMEs, and a deployed portfolio site. Recruiters will notice the difference.', tag: 'Service', price: fixed(60), images: [POST_IMAGES.tech_creative[2]], hashtags: ['github', 'portfolio', 'deployment'], helpCategoryIds: ['tech-web-app-dev'], authorId: efua.id } }),
    prisma.post.create({ data: { title: 'YouTube & TikTok Video Editing', description: 'Fast edits for campus creators. Captions, transitions, and colour grading included. 48-hour turnaround.', tag: 'Service', price: fixed(45), images: [POST_IMAGES.media[2]], hashtags: ['video', 'youtube', 'tiktok'], helpCategoryIds: ['media-video-editing'], authorId: nana.id } }),
    prisma.post.create({ data: { title: 'French ↔ English Academic Translation', description: 'Accurate translation for research papers and theses. Native-level fluency in both languages.', tag: 'Service', price: fixed(35), images: [POST_IMAGES.academics[1]], hashtags: ['translation', 'french', 'academic'], helpCategoryIds: ['academics-translation'], authorId: joe.id } }),
    prisma.post.create({ data: { title: 'Graduation Braiding & Makeup', description: 'Look your best on graduation day. Mobile braiding and makeup service anywhere on campus.', tag: 'Service', price: fixed(40), images: [POST_IMAGES.campus_lifestyle[1]], hashtags: ['beauty', 'graduation', 'makeup'], helpCategoryIds: ['campus-beauty'], authorId: akosua.id } }),
    prisma.post.create({ data: { title: 'Physics Study Group — Weekly Sessions', description: 'Small group sessions for mechanics and electromagnetism. Max 5 students per group.', tag: 'Service', price: range(15, 25), images: [POST_IMAGES.academics[2]], hashtags: ['physics', 'studygroup', 'exam'], helpCategoryIds: ['academics-study-group'], authorId: kwame.id } }),
    prisma.post.create({ data: { title: 'IT Support — Mac & Windows', description: 'Slow laptop? Wi-Fi issues? I troubleshoot hardware and software problems on campus.', tag: 'Service', price: negotiated(), images: [POST_IMAGES.tech_creative[1]], hashtags: ['it', 'support', 'laptop'], helpCategoryIds: ['tech-it-support'], authorId: efua.id } }),

    // Request posts
    prisma.post.create({ data: { title: 'Need Physics Tutoring Before Finals', description: 'Finals are in two weeks and I am lost on electromagnetism and waves. Looking for someone patient who can explain from first principles.', tag: 'Request', price: fixed(25), images: [POST_IMAGES.academics[0]], hashtags: ['physics', 'tutoring', 'help'], helpCategoryIds: ['academics-tutoring'], authorId: testUser.id } }),
    prisma.post.create({ data: { title: 'Looking for a Graphic Designer for Club Flyer', description: 'Our CS club is hosting a hackathon next month and we need a bold eye-catching flyer. Budget flexible for the right person.', tag: 'Request', price: fixed(30), images: [POST_IMAGES.media[1]], hashtags: ['design', 'flyer', 'events'], helpCategoryIds: ['media-graphic-design'], authorId: yaw.id } }),
    prisma.post.create({ data: { title: 'Need Camera Rental for the Weekend', description: 'Working on a short documentary project and need a decent camera for Saturday and Sunday. Willing to pay a deposit.', tag: 'Request', price: fixed(40), images: [POST_IMAGES.campus_lifestyle[2]], hashtags: ['camera', 'rental', 'documentary'], helpCategoryIds: ['campus-rentals'], authorId: testUser.id } }),
    prisma.post.create({ data: { title: 'French to English Translation Needed', description: 'Have a 4-page French academic article I need translated to English accurately for my research paper. Need it by end of week.', tag: 'Request', price: fixed(35), images: [], hashtags: ['translation', 'french', 'english'], helpCategoryIds: ['academics-translation'], authorId: yaw.id } }),
    prisma.post.create({ data: { title: 'Need Video Editor for Society Recap', description: 'Our debate society filmed a 2-hour event and needs a 5-minute highlight reel by Friday.', tag: 'Request', price: range(40, 60), images: [POST_IMAGES.media[0]], hashtags: ['video', 'editing', 'society'], helpCategoryIds: ['media-video-editing'], authorId: testUser.id } }),

    // Moderation edge cases
    prisma.post.create({ data: { title: 'Draft: Personal Tutoring Ad (Hidden)', description: 'Work-in-progress listing — hidden by owner while I update availability.', tag: 'Service', price: fixed(20), images: [], hashtags: ['draft'], helpCategoryIds: ['academics-tutoring'], authorId: testUser.id, status: PostStatus.hidden_by_owner } }),
    prisma.post.create({ data: { title: 'Suspicious "Free Money" Campus Gig', description: 'Removed by admin for violating community guidelines.', tag: 'Service', price: negotiated(), images: [], hashtags: ['scam'], helpCategoryIds: [], authorId: marcus.id, status: PostStatus.removed_by_admin } }),
  ]);
  console.log('✅ Posts seeded');

  const [
    postMath, postCV, postPhoto, postDelivery, postDebug, postLogo, postLinkedIn, postGithub,
    postVideo, postTranslation, postBeauty, postPhysicsGroup, postIT,
    postPhysicsReq, postFlyerReq, postCameraReq, postTranslationReq, postVideoReq,
    postHidden, postRemoved,
  ] = posts;

  // ── 6. SERVICE REQUESTS ────────────────────────────────────────────────────
  const srCompleted = await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: kwame.id, postId: postMath.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.completed, message: 'Hi, I need help with my calculus exam next week.', acceptedAt: daysAgo(7), completionRequestedAt: daysAgo(2), completedAt: daysAgo(1) },
  });

  const srCompletedUnreviewed = await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: kofi.id, postId: postDelivery.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.completed, message: 'Can you deliver my textbook from the library?', acceptedAt: daysAgo(10), completionRequestedAt: daysAgo(4), completedAt: daysAgo(3) },
  });

  const srActive = await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: ama.id, postId: postPhoto.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.active, message: 'I need a photographer for my graduation ceremony next month.', acceptedAt: daysAgo(3) },
  });

  const srPending = await prisma.serviceRequest.create({
    data: { requesterId: yaw.id, providerId: abena.id, postId: postCV.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.pending, message: 'Please review my CV for a summer internship application.' },
  });

  const srPendingReview = await prisma.serviceRequest.create({
    data: { requesterId: yaw.id, providerId: kofi.id, postId: postDelivery.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.pending_review, message: 'Can you pick up my textbook from the library?', acceptedAt: daysAgo(4), completionRequestedAt: hoursAgo(1) },
  });

  const srDeclined = await prisma.serviceRequest.create({
    data: { requesterId: yaw.id, providerId: efua.id, postId: postDebug.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.declined, message: 'I need help debugging my Python script.' },
  });

  await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: abena.id, postId: postLinkedIn.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.cancelled, message: 'I want to optimise my LinkedIn before internship season.', acceptedAt: daysAgo(5) },
  });

  const srResponseFlyer = await prisma.serviceRequest.create({
    data: { requesterId: yaw.id, providerId: ama.id, postId: postFlyerReq.id, kind: ServiceRequestKind.response, status: ServiceRequestStatus.active, message: 'I can design your hackathon flyer — I have done 10+ club events.', acceptedAt: daysAgo(2) },
  });

  const srResponsePhysics = await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: kwame.id, postId: postPhysicsReq.id, kind: ServiceRequestKind.response, status: ServiceRequestStatus.pending, message: 'I can help with electromagnetism — I have a study plan for finals prep.' },
  });

  const srResponseVideo = await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: nana.id, postId: postVideoReq.id, kind: ServiceRequestKind.response, status: ServiceRequestStatus.active, message: 'I can turn your 2-hour footage into a tight 5-minute recap by Friday.', acceptedAt: daysAgo(1) },
  });

  console.log('✅ Service requests seeded');

  // ── 7. REVIEWS ─────────────────────────────────────────────────────────────
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: kwame.id, rating: 5, comment: 'Kwame broke down integration by parts in a way that finally clicked. Passed my exam with a B+!', serviceTitle: 'One-on-One Math & Calculus Tutoring', serviceRequestId: srCompleted.id },
  });
  await prisma.review.create({
    data: { reviewerId: yaw.id, revieweeId: ama.id, rating: 5, comment: 'Ama delivered the flyer ahead of schedule and it looked incredible. Will use again for our next event.', serviceTitle: 'Flyer & Poster Design' },
  });
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: ama.id, rating: 4, comment: 'Great photographer. Edited photos were delivered fast and the quality was excellent.', serviceTitle: 'Event Photography' },
  });
  await prisma.review.create({
    data: { reviewerId: yaw.id, revieweeId: abena.id, rating: 5, comment: 'Abena completely transformed my CV. Got three interview calls the week after sending it out.', serviceTitle: 'CV & Cover Letter Writing' },
  });
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: efua.id, rating: 5, comment: 'Found the bug in 20 minutes that I had been staring at for two days. Absolute lifesaver before my deadline.', serviceTitle: 'Code Debugging & Review' },
  });
  await prisma.review.create({
    data: { reviewerId: yaw.id, revieweeId: kofi.id, rating: 4, comment: 'Kofi picked up my textbook and was at my door in under an hour. Very communicative throughout.', serviceTitle: 'Same-Day Campus Delivery' },
  });
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: kwame.id, rating: 5, comment: 'Second session was even better. Helped me understand physics waves from scratch.', serviceTitle: 'Physics Study Group' },
  });
  await prisma.review.create({
    data: { reviewerId: yaw.id, revieweeId: joe.id, rating: 5, comment: 'Joe translated my French article flawlessly. Saved my research deadline.', serviceTitle: 'French ↔ English Academic Translation' },
  });
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: nana.id, rating: 4, comment: 'Nana edited our society recap video perfectly. Great pacing and music choices.', serviceTitle: 'YouTube & TikTok Video Editing' },
  });
  console.log('✅ Reviews seeded');

  // ── 8. CHAT MESSAGES ───────────────────────────────────────────────────────
  await prisma.chatMessage.createMany({
    data: [
      { senderId: testUser.id, receiverId: kwame.id, content: 'Hi Kwame! I saw your math tutoring post. I have an exam in 10 days and really need help with calculus.', postId: postMath.id, kind: MessageKind.text, isRead: true, createdAt: daysAgo(8) },
      { senderId: kwame.id, receiverId: testUser.id, content: 'Hey Alex! Sure, I can help. Which topics are you struggling with most?', kind: MessageKind.text, isRead: true, createdAt: new Date(daysAgo(8).getTime() + 300000) },
      { senderId: testUser.id, receiverId: kwame.id, content: 'Mostly integration by parts and u-substitution. I get lost when they combine both.', kind: MessageKind.text, isRead: true, createdAt: new Date(daysAgo(8).getTime() + 600000) },
      { senderId: kwame.id, receiverId: testUser.id, content: 'Perfect, those are very fixable! Let us do a 2-hour session this Saturday.', kind: MessageKind.text, isRead: true, createdAt: daysAgo(7) },
      { senderId: kwame.id, receiverId: testUser.id, content: '✅ Service request accepted. See you Saturday at the library, second floor.', kind: MessageKind.system, isRead: true, createdAt: daysAgo(6) },
      { senderId: testUser.id, receiverId: kwame.id, content: 'That session was incredibly helpful. I finally understand the chain rule properly!', kind: MessageKind.text, isRead: true, createdAt: daysAgo(1) },
      { senderId: kwame.id, receiverId: testUser.id, content: 'Great work putting in the effort! Let me know if you need anything before the exam.', kind: MessageKind.text, isRead: false, createdAt: new Date(daysAgo(1).getTime() + 3600000) },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      { senderId: testUser.id, receiverId: ama.id, content: 'Hi Ama! I need a photographer for my graduation ceremony next month.', postId: postPhoto.id, kind: MessageKind.text, isRead: true, createdAt: daysAgo(4) },
      { senderId: ama.id, receiverId: testUser.id, content: 'Congratulations in advance! What date and venue? I will check my availability.', kind: MessageKind.text, isRead: true, createdAt: new Date(daysAgo(4).getTime() + 1800000) },
      { senderId: testUser.id, receiverId: ama.id, content: 'It is on the 15th at the main auditorium. The ceremony is about 3 hours.', kind: MessageKind.text, isRead: true, createdAt: daysAgo(3) },
      { senderId: ama.id, receiverId: testUser.id, content: 'That works for me! I will bring my full kit. Let us confirm the details closer to the date.', kind: MessageKind.text, isRead: false, createdAt: new Date(daysAgo(3).getTime() + 3600000) },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      { senderId: yaw.id, receiverId: abena.id, content: 'Hello Abena, I saw your CV writing post. I am applying for summer internships and need help urgently.', postId: postCV.id, kind: MessageKind.text, isRead: true, createdAt: daysAgo(2) },
      { senderId: abena.id, receiverId: yaw.id, content: 'Hi Yaw! Happy to help. Send me your current CV and the roles you are targeting.', kind: MessageKind.text, isRead: true, createdAt: new Date(daysAgo(2).getTime() + 3600000) },
      { senderId: yaw.id, receiverId: abena.id, content: 'I have sent the service request. My CV is a bit all over the place, I will be honest!', kind: MessageKind.text, isRead: false, createdAt: daysAgo(1) },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      { senderId: yaw.id, receiverId: efua.id, content: 'Hi Efua, I saw your debugging post. Can you help with a Python assignment?', postId: postDebug.id, kind: MessageKind.text, isRead: true, createdAt: daysAgo(5) },
      { senderId: efua.id, receiverId: yaw.id, content: 'Hey Yaw! What is the assignment about? Send me the error message if you have one.', kind: MessageKind.text, isRead: true, createdAt: new Date(daysAgo(5).getTime() + 7200000) },
      { senderId: yaw.id, receiverId: efua.id, content: 'It is a data structures project — my linked list insert keeps throwing IndexError.', kind: MessageKind.text, isRead: true, createdAt: daysAgo(4) },
      { senderId: efua.id, receiverId: yaw.id, content: 'Sorry, I am fully booked this week and cannot take this on right now.', kind: MessageKind.text, isRead: true, createdAt: daysAgo(3) },
      { senderId: efua.id, receiverId: yaw.id, content: 'Service request declined.', kind: MessageKind.system, isRead: false, createdAt: daysAgo(3) },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      { senderId: testUser.id, receiverId: kofi.id, content: 'Hey Kofi! Can you grab my calculus textbook from the library today?', postId: postDelivery.id, kind: MessageKind.text, isRead: true, createdAt: daysAgo(10) },
      { senderId: kofi.id, receiverId: testUser.id, content: 'On it! Which floor is the book on?', kind: MessageKind.text, isRead: true, createdAt: new Date(daysAgo(10).getTime() + 900000) },
      { senderId: testUser.id, receiverId: kofi.id, content: 'Third floor, call number QA303. I will be in Room 204.', kind: MessageKind.text, isRead: true, createdAt: new Date(daysAgo(10).getTime() + 1800000) },
      { senderId: kofi.id, receiverId: testUser.id, content: 'Delivered! Book is outside your door.', kind: MessageKind.text, isRead: true, createdAt: daysAgo(3) },
      { senderId: kofi.id, receiverId: testUser.id, content: '✅ Service marked complete. Hope the textbook helps with your exam!', kind: MessageKind.system, isRead: false, createdAt: daysAgo(3) },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      { senderId: testUser.id, receiverId: nana.id, content: 'Hi Nana! I posted a request for a society recap edit — are you available this week?', postId: postVideoReq.id, kind: MessageKind.text, isRead: true, createdAt: daysAgo(2) },
      { senderId: nana.id, receiverId: testUser.id, content: 'Yes! Send me the raw footage and I will have a draft by Thursday.', kind: MessageKind.text, isRead: false, createdAt: daysAgo(1) },
    ],
  });

  console.log('✅ Chat messages seeded');

  // ── 9. PINNED & MUTED CONVERSATIONS ────────────────────────────────────────
  await prisma.pinnedConversation.createMany({
    data: [
      { userId: testUser.id, participantUsername: 'kwameasante' },
      { userId: ama.id, participantUsername: 'alexmensah' },
    ],
  });

  await prisma.mutedConversation.createMany({
    data: [
      { userId: yaw.id, participantUsername: 'efuadarkwa' },
      { userId: testUser.id, participantUsername: 'marcusosei' },
    ],
  });
  console.log('✅ Pinned & muted conversations seeded');

  // ── 10. NOTIFICATIONS ──────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: testUser.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: testUser.id, kind: NotificationKind.message, title: 'New message from Ama Owusu', body: 'That works for me! I will bring my full kit.', read: false, data: { type: 'message', username: 'amaowusu' } },
      { userId: testUser.id, kind: NotificationKind.service, title: 'Service request accepted', body: 'Kwame Asante accepted your tutoring request. You are set for Saturday!', read: true, data: { type: 'service', serviceRequestId: srCompleted.id } },
      { userId: testUser.id, kind: NotificationKind.service, title: 'Service completed', body: 'Your tutoring session with Kwame Asante is complete. Leave a review!', read: true, data: { type: 'service', serviceRequestId: srCompleted.id } },
      { userId: testUser.id, kind: NotificationKind.service, title: 'Delivery completed', body: 'Your textbook delivery with Kofi Boateng is complete. Leave a review!', read: false, data: { type: 'service', serviceRequestId: srCompletedUnreviewed.id } },
      { userId: testUser.id, kind: NotificationKind.request, title: 'New response to your request', body: 'Nana Adjei responded to your video editing request.', read: false, data: { type: 'request', serviceRequestId: srResponseVideo.id } },

      { userId: kwame.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: kwame.id, kind: NotificationKind.request, title: 'New service request', body: 'Alex Mensah has requested your math tutoring service.', read: true, data: { type: 'request', serviceRequestId: srCompleted.id } },
      { userId: kwame.id, kind: NotificationKind.request, title: 'New response request', body: 'Alex Mensah posted a physics tutoring request you may want to respond to.', read: false, data: { type: 'request', serviceRequestId: srResponsePhysics.id } },
      { userId: kwame.id, kind: NotificationKind.message, title: 'New message from Alex Mensah', body: 'That session was incredibly helpful. I finally understand the chain rule!', read: false, data: { type: 'message', username: 'alexmensah' } },

      { userId: ama.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: ama.id, kind: NotificationKind.request, title: 'New service request', body: 'Alex Mensah wants photography coverage for their graduation ceremony.', read: false, data: { type: 'request', serviceRequestId: srActive.id } },
      { userId: ama.id, kind: NotificationKind.request, title: 'Response accepted', body: 'Your response to Yaw Darko\'s flyer request is now active.', read: false, data: { type: 'request', serviceRequestId: srResponseFlyer.id } },

      { userId: abena.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: abena.id, kind: NotificationKind.request, title: 'New service request', body: 'Yaw Darko has requested your CV writing service.', read: false, data: { type: 'request', serviceRequestId: srPending.id } },

      { userId: kofi.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: kofi.id, kind: NotificationKind.service, title: 'Completion confirmed', body: 'Yaw Darko confirmed your delivery is complete. Well done!', read: false, data: { type: 'service', serviceRequestId: srPendingReview.id } },

      { userId: yaw.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: yaw.id, kind: NotificationKind.service, title: 'Service request declined', body: 'Efua Darkwa has declined your debugging request. You can find another provider on the marketplace.', read: false, data: { type: 'service', serviceRequestId: srDeclined.id } },
      { userId: yaw.id, kind: NotificationKind.message, title: 'New message from Abena Frimpong', body: 'Hi Yaw! Happy to help. Send me your current CV and the roles you are targeting.', read: true, data: { type: 'message', username: 'abenafrimpong' } },

      { userId: nana.id, kind: NotificationKind.request, title: 'New response opportunity', body: 'Alex Mensah is looking for a video editor for a society recap.', read: false, data: { type: 'request', serviceRequestId: srResponseVideo.id } },

      { userId: admin.id, kind: NotificationKind.system, title: 'Welcome to PUConnect Admin 🛡️', body: 'You have admin access. Use the admin panel to monitor and moderate the platform.', read: true, data: { type: 'system' } },
    ],
  });
  console.log('✅ Notifications seeded');

  // ── 11. REPORTS, FEEDBACK & ADMIN ACTION LOG ───────────────────────────────
  const reportPendingUser = await prisma.report.create({
    data: { reporterId: testUser.id, targetType: ReportTargetType.user, targetId: marcus.id, reason: ReportReason.spam, description: 'This user keeps sending unsolicited messages about fake gigs.', status: ReportStatus.pending },
  });

  const reportPendingPost = await prisma.report.create({
    data: { reporterId: yaw.id, targetType: ReportTargetType.post, targetId: postDebug.id, reason: ReportReason.inappropriate_content, description: 'Post contains misleading pricing information.', status: ReportStatus.pending },
  });

  const reportReviewed = await prisma.report.create({
    data: { reporterId: testUser.id, targetType: ReportTargetType.post, targetId: postIT.id, reason: ReportReason.other, description: 'Not sure if this provider is licensed for IT support.', status: ReportStatus.reviewed, reviewedAt: daysAgo(2), reviewedBy: admin.id },
  });

  const reportDismissed = await prisma.report.create({
    data: { reporterId: yaw.id, targetType: ReportTargetType.user, targetId: kwame.id, reason: ReportReason.harassment, description: 'Provider was pushy about booking — turned out to be a misunderstanding.', status: ReportStatus.dismissed, reviewedAt: daysAgo(5), reviewedBy: admin.id },
  });

  const reportActioned = await prisma.report.create({
    data: { reporterId: testUser.id, targetType: ReportTargetType.post, targetId: postRemoved.id, reason: ReportReason.scam, description: 'Obvious scam post promising free money.', status: ReportStatus.actioned, reviewedAt: daysAgo(10), reviewedBy: admin.id },
  });

  await prisma.feedback.createMany({
    data: [
      { userId: testUser.id, message: 'Love the app! Would be great to have a rating filter on the explore page.', status: 'open' },
      { userId: yaw.id, message: 'The chat sometimes lags when loading older messages. Please fix!', status: 'open' },
      { userId: ama.id, message: 'Provider dashboard is great. Would love bulk post scheduling.', status: 'closed' },
    ],
  });

  await prisma.adminActionLog.createMany({
    data: [
      { adminId: admin.id, action: 'user_suspended', targetType: 'user', targetId: marcus.id, fromValue: 'active', toValue: 'suspended', reason: 'Multiple spam reports and policy violations', createdAt: daysAgo(8) },
      { adminId: admin.id, action: 'post_removed', targetType: 'post', targetId: postRemoved.id, fromValue: 'active', toValue: 'removed_by_admin', reason: 'Scam content reported by community', createdAt: daysAgo(10) },
      { adminId: admin.id, action: 'report_resolved', targetType: 'report', targetId: reportActioned.id, fromValue: 'pending', toValue: 'actioned', reason: 'Removed scam post and suspended author', createdAt: daysAgo(10) },
      { adminId: admin.id, action: 'report_resolved', targetType: 'report', targetId: reportReviewed.id, fromValue: 'pending', toValue: 'reviewed', reason: 'Verified provider credentials — no action needed', createdAt: daysAgo(2) },
      { adminId: admin.id, action: 'report_resolved', targetType: 'report', targetId: reportDismissed.id, fromValue: 'pending', toValue: 'dismissed', reason: 'Reporter and provider resolved misunderstanding offline', createdAt: daysAgo(5) },
    ],
  });
  console.log('✅ Reports, feedback & admin action logs seeded');

  // ── DONE ───────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!');
  console.log('Admin account:  admin@puconnect.app / Admin1234!');
  console.log('Test account:   alex@puconnect.app  / Test1234!');
  console.log('Other accounts (all password: Test1234!):');
  console.log('  ama@puconnect.app       — provider, Media');
  console.log('  kwame@puconnect.app     — provider, Academics');
  console.log('  abena@puconnect.app     — provider, Business & Career');
  console.log('  kofi@puconnect.app      — provider, Campus & Lifestyle');
  console.log('  efua@puconnect.app      — provider, Tech & Creative');
  console.log('  nana@puconnect.app      — provider, Media (video editing)');
  console.log('  joe@puconnect.app       — provider, Academics (translation)');
  console.log('  akosua@puconnect.app    — provider, Campus & Lifestyle (beauty)');
  console.log('  yaw@puconnect.app       — regular user');
  console.log('  marcus@puconnect.app    — suspended user (admin testing)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
