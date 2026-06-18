import { PrismaClient, UserRole, ExploreCategoryId, NotificationKind, MessageKind, ServiceRequestStatus, ServiceRequestKind } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AVATAR = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;
const UNSPLASH = (id: string, w = 800, h = 600) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;

const POST_IMAGES = {
  tutoring: [
    UNSPLASH('photo-1522202176988-66273c2fd55f'),
    UNSPLASH('photo-1434030216411-0b793f4b4173'),
    UNSPLASH('photo-1513258496099-48168024aec0'),
  ],
  tech: [
    UNSPLASH('photo-1461749280684-dccba630e2f6'),
    UNSPLASH('photo-1498050108023-c5249f4df085'),
    UNSPLASH('photo-1555066931-4365d14bab8c'),
  ],
  design: [
    UNSPLASH('photo-1561070791-2526d30994b5'),
    UNSPLASH('photo-1572044162444-ad60f128bdea'),
    UNSPLASH('photo-1600132806370-bf17e65e942f'),
  ],
  career: [
    UNSPLASH('photo-1486312338219-ce68d2c6f44d'),
    UNSPLASH('photo-1454165804606-c3d57bc86b40'),
    UNSPLASH('photo-1507003211169-0a1dd7228f2d'),
  ],
  campus: [
    UNSPLASH('photo-1523050854058-8df90110c9f1'),
    UNSPLASH('photo-1541339907198-e08756dedf3f'),
    UNSPLASH('photo-1519389950473-47ba0277781c'),
  ],
};

async function main() {
  console.log('🌱 Seeding database...');

  // ─── CLEANUP ───────────────────────────────────────────────────────────────
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

  // ─── 1. CATEGORIES ─────────────────────────────────────────────────────────
  await prisma.category.createMany({
    data: [
      {
        id: 'tutoring',
        title: 'Tutoring & Academics',
        pillLabel: 'Tutoring',
        tagline: 'Learn smarter, together on campus',
        description: 'Math, science, writing help, exam prep, and study partners for tough courses.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-tutoring/240/240',
        accentColor: '#7C3AED',
        iconName: 'school-outline',
      },
      {
        id: 'tech',
        title: 'Tech & Development',
        pillLabel: 'Tech',
        tagline: 'Build the tools students actually need',
        description: 'Websites, apps, debugging, portfolio builds, and campus tool prototypes.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-tech/240/240',
        accentColor: '#2563EB',
        iconName: 'code-slash-outline',
      },
      {
        id: 'design',
        title: 'Design & Creative',
        pillLabel: 'Design',
        tagline: 'Make every campus moment look sharp',
        description: 'Posters, branding, UI mockups, photography, and social media assets.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-design/240/240',
        accentColor: '#EA580C',
        iconName: 'color-palette-outline',
      },
      {
        id: 'career',
        title: 'Career & Professional',
        pillLabel: 'Career',
        tagline: 'Stand out before graduation day',
        description: 'Resume reviews, interview prep, LinkedIn polish, and personal statements.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-career/240/240',
        accentColor: '#059669',
        iconName: 'briefcase-outline',
      },
      {
        id: 'campus',
        title: 'Campus Life & Errands',
        pillLabel: 'Campus',
        tagline: 'Small tasks handled while you study',
        description: 'Laundry runs, deliveries, moving help, and other on-campus logistics.',
        imageUrl: 'https://picsum.photos/seed/pu-explore-campus/240/240',
        accentColor: '#DB2777',
        iconName: 'bicycle-outline',
      },
    ],
  });
  console.log('✅ Categories seeded');

  // ─── 2. CATEGORY SERVICES ──────────────────────────────────────────────────
  await prisma.categoryService.createMany({
    data: [
      { id: 'tutoring-1', categoryId: 'tutoring', title: 'STEM & Math Tutoring', description: 'One-on-one help for calculus, linear algebra, physics, and exam review sessions.', filterTags: ['CALCULUS', 'LINEAR ALGEBRA', 'EXAM PREP'] },
      { id: 'tutoring-2', categoryId: 'tutoring', title: 'Writing & Essay Coaching', description: 'Structure, clarity, and feedback on research papers, lab reports, and take-home essays.', filterTags: ['WRITING', 'ESSAYS', 'APA STYLE'] },
      { id: 'tutoring-3', categoryId: 'tutoring', title: 'Study Groups & Exam Prep', description: 'Weekly study partners, practice tests, and last-minute review before midterms and finals.', filterTags: ['STUDY GROUPS', 'EXAM PREP', 'MIDTERMS'] },
      { id: 'tech-1', categoryId: 'tech', title: 'Website & App Development', description: 'Landing pages, club sites, and mobile prototypes built with modern React and Expo stacks.', filterTags: ['REACT', 'EXPO', 'WEBSITES'] },
      { id: 'tech-2', categoryId: 'tech', title: 'Debugging & Code Review', description: 'Pair programming, bug fixes, and architecture tips for class projects and hackathons.', filterTags: ['DEBUGGING', 'CODE REVIEW', 'PAIR PROGRAMMING'] },
      { id: 'tech-3', categoryId: 'tech', title: 'Portfolio & GitHub Setup', description: 'Polish your developer portfolio, README files, and deployment workflow before recruiting season.', filterTags: ['PORTFOLIO', 'GITHUB', 'DEPLOYMENT'] },
      { id: 'design-1', categoryId: 'design', title: 'Event Posters & Flyers', description: 'Bold visuals for club meetings, fundraisers, and campus events with fast turnaround.', filterTags: ['POSTERS', 'FLYERS', 'EVENTS'] },
      { id: 'design-2', categoryId: 'design', title: 'UI Mockups & Prototypes', description: 'Figma screens and clickable flows for apps, pitch decks, and class design assignments.', filterTags: ['FIGMA', 'UI DESIGN', 'PROTOTYPES'] },
      { id: 'design-3', categoryId: 'design', title: 'Brand & Social Kits', description: 'Logos, color palettes, and Instagram-ready templates for student orgs and side projects.', filterTags: ['BRANDING', 'SOCIAL MEDIA', 'LOGOS'] },
      { id: 'career-1', categoryId: 'career', title: 'Resume & CV Review', description: 'Tailored edits for internships, research roles, and your first full-time applications.', filterTags: ['RESUMES', 'CV', 'INTERNSHIPS'] },
      { id: 'career-2', categoryId: 'career', title: 'Interview Prep & Mock Sessions', description: 'Behavioral questions, technical screens, and confidence coaching before big interviews.', filterTags: ['INTERVIEWS', 'MOCK SESSIONS', 'BEHAVIORAL'] },
      { id: 'career-3', categoryId: 'career', title: 'LinkedIn & Personal Statements', description: 'Headline polish, summary rewrites, and grad-school or scholarship essay feedback.', filterTags: ['LINKEDIN', 'ESSAYS', 'SCHOLARSHIPS'] },
      { id: 'campus-1', categoryId: 'campus', title: 'Laundry & Pickup Runs', description: 'Reliable wash-and-fold or dorm pickup when your week is packed with classes.', filterTags: ['LAUNDRY', 'PICKUP', 'WASH-AND-FOLD'] },
      { id: 'campus-2', categoryId: 'campus', title: 'Moving & Heavy Lifting', description: 'Help hauling boxes, furniture, and gear during move-in, move-out, or room swaps.', filterTags: ['MOVING', 'LIFTING', 'MOVE-IN'] },
      { id: 'campus-3', categoryId: 'campus', title: 'Errands & Delivery', description: 'Textbooks, groceries, and packages brought to your door anywhere on campus.', filterTags: ['DELIVERY', 'ERRANDS', 'GROCERIES'] },
    ],
  });
  console.log('✅ Category services seeded');

  // ─── 3. USERS ──────────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  // Test account (use this to log in)
  const testUser = await prisma.user.create({
    data: {
      name: 'Alex Mensah',
      email: 'alex@puconnect.app',
      username: 'alexmensah',
      password: hash('Test1234!'),
      role: UserRole.user,
      avatarUrl: AVATAR('alexmensah'),
      bio: 'Computer Science student. Love building apps and solving problems.',
      categoryId: 'tech',
      skillTitle: 'Full Stack Developer',
      expertiseTags: ['React Native', 'Node.js', 'TypeScript'],
      serviceIds: ['tech-1', 'tech-2'],
    },
  });

  // Provider users
  const ama = await prisma.user.create({
    data: {
      name: 'Ama Owusu',
      email: 'ama@puconnect.app',
      username: 'amaowusu',
      password: hash('Test1234!'),
      role: UserRole.provider,
      avatarUrl: AVATAR('amaowusu'),
      bio: 'Design student specializing in brand identity and UI. 3 years of freelance experience.',
      categoryId: 'design',
      skillTitle: 'Brand & UI Designer',
      expertiseTags: ['Figma', 'Branding', 'Social Media'],
      serviceIds: ['design-1', 'design-2', 'design-3'],
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
      bio: 'Mathematics & Statistics tutor. Helped 50+ students pass calculus.',
      categoryId: 'tutoring',
      skillTitle: 'STEM Tutor',
      expertiseTags: ['Calculus', 'Statistics', 'Exam Prep'],
      serviceIds: ['tutoring-1', 'tutoring-3'],
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
      bio: 'Career counselor and resume coach. Former HR intern at a top firm.',
      categoryId: 'career',
      skillTitle: 'Career Coach',
      expertiseTags: ['Resumes', 'Interview Prep', 'LinkedIn'],
      serviceIds: ['career-1', 'career-2', 'career-3'],
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
      bio: 'Campus errand guy. Fast, reliable, and always on time.',
      categoryId: 'campus',
      skillTitle: 'Campus Assistant',
      expertiseTags: ['Delivery', 'Errands', 'Moving'],
      serviceIds: ['campus-1', 'campus-2', 'campus-3'],
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
      categoryId: 'tech',
      skillTitle: 'Software Developer',
      expertiseTags: ['Debugging', 'React', 'Python'],
      serviceIds: ['tech-2', 'tech-3'],
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
      categoryId: null,
      expertiseTags: [],
      serviceIds: [],
    },
  });

  console.log('✅ Users seeded');

  // ─── 4. PROVIDER SERVICES ──────────────────────────────────────────────────
  await prisma.providerService.createMany({
    data: [
      { userId: ama.id, categoryId: 'design', title: 'Event Poster Design', description: 'Eye-catching posters for your club or campus event. Delivered in 48hrs.', price: { type: 'fixed', amount: 50 }, tags: ['POSTERS', 'EVENTS', 'FAST DELIVERY'] },
      { userId: ama.id, categoryId: 'design', title: 'UI/UX Figma Mockup', description: 'Full screen designs and clickable prototypes for your app idea.', price: { type: 'fixed', amount: 120 }, tags: ['FIGMA', 'UI DESIGN', 'PROTOTYPES'] },
      { userId: kwame.id, categoryId: 'tutoring', title: 'Calculus One-on-One', description: 'Weekly sessions covering limits, derivatives, and integrals. Exam rescue available.', price: { type: 'hourly', amount: 30 }, tags: ['CALCULUS', 'EXAM PREP'] },
      { userId: kwame.id, categoryId: 'tutoring', title: 'Statistics Study Group', description: 'Small group sessions for probability, regression, and data interpretation.', price: { type: 'hourly', amount: 20 }, tags: ['STATISTICS', 'STUDY GROUPS'] },
      { userId: abena.id, categoryId: 'career', title: 'Resume Review & Rewrite', description: 'Full review with tracked edits and a rewrite tailored to your target role.', price: { type: 'fixed', amount: 40 }, tags: ['RESUMES', 'INTERNSHIPS'] },
      { userId: abena.id, categoryId: 'career', title: 'Mock Interview Session', description: '60-minute session with real-world behavioral and technical questions.', price: { type: 'fixed', amount: 35 }, tags: ['INTERVIEWS', 'MOCK SESSIONS'] },
      { userId: kofi.id, categoryId: 'campus', title: 'Same-Day Errand Run', description: 'Groceries, printing, textbooks — picked up and delivered to your dorm.', price: { type: 'fixed', amount: 15 }, tags: ['ERRANDS', 'DELIVERY'] },
      { userId: kofi.id, categoryId: 'campus', title: 'Move-In/Move-Out Help', description: 'Heavy lifting and room setup assistance. Bring a friend or I bring mine.', price: { type: 'hourly', amount: 25 }, tags: ['MOVING', 'LIFTING'] },
      { userId: efua.id, categoryId: 'tech', title: 'Code Debugging Session', description: 'Live pair programming to find and fix bugs in your project or assignment.', price: { type: 'hourly', amount: 35 }, tags: ['DEBUGGING', 'PAIR PROGRAMMING'] },
      { userId: efua.id, categoryId: 'tech', title: 'Portfolio & GitHub Polish', description: 'Clean up your GitHub profile, README, and deploy a portfolio site.', price: { type: 'fixed', amount: 60 }, tags: ['PORTFOLIO', 'GITHUB'] },
    ],
  });
  console.log('✅ Provider services seeded');

  // ─── 5. POSTS ──────────────────────────────────────────────────────────────
  const posts = await Promise.all([
    // Service posts by providers
    prisma.post.create({ data: { title: 'Professional Logo & Brand Kit', description: 'I will design a complete brand identity: logo, color palette, and social media templates. Perfect for student orgs and side projects. 3 revisions included.', tag: 'Service', price: { type: 'fixed', amount: 80 }, images: [POST_IMAGES.design[0], POST_IMAGES.design[1]], hashtags: ['branding', 'logo', 'design'], helpCategoryIds: ['design-3'], authorId: ama.id } }),
    prisma.post.create({ data: { title: 'Calculus Tutoring — All Levels', description: 'Struggling with derivatives, integrals, or limits? I have helped over 50 students pass. Flexible scheduling including weekends and evenings before exams.', tag: 'Service', price: { type: 'hourly', amount: 30 }, images: [POST_IMAGES.tutoring[0]], hashtags: ['calculus', 'math', 'tutoring'], helpCategoryIds: ['tutoring-1'], authorId: kwame.id } }),
    prisma.post.create({ data: { title: 'Resume Review & LinkedIn Makeover', description: 'Former HR intern here. I will review your resume, rewrite weak bullet points, and polish your LinkedIn headline and summary. Turnaround within 24 hours.', tag: 'Service', price: { type: 'fixed', amount: 45 }, images: [POST_IMAGES.career[0]], hashtags: ['resume', 'career', 'linkedin'], helpCategoryIds: ['career-1', 'career-3'], authorId: abena.id } }),
    prisma.post.create({ data: { title: 'Campus Errand & Delivery Service', description: 'Need groceries, a textbook from the library, or a package picked up? I do same-day runs anywhere on campus. Fast and reliable.', tag: 'Service', price: { type: 'fixed', amount: 15 }, images: [POST_IMAGES.campus[0]], hashtags: ['errands', 'delivery', 'campus'], helpCategoryIds: ['campus-3'], authorId: kofi.id } }),
    prisma.post.create({ data: { title: 'React Native Bug Fixing & Code Review', description: 'Stuck on a tricky bug or need a second pair of eyes on your project? I specialise in React Native and Node.js. Live pair programming available.', tag: 'Service', price: { type: 'hourly', amount: 35 }, images: [POST_IMAGES.tech[0]], hashtags: ['reactnative', 'debugging', 'codeReview'], helpCategoryIds: ['tech-2'], authorId: efua.id } }),
    prisma.post.create({ data: { title: 'Event Poster Design (48hr Turnaround)', description: 'Bold, print-ready event posters for club nights, fundraisers, or departmental events. Tell me the theme and I will handle the rest.', tag: 'Service', price: { type: 'fixed', amount: 50 }, images: [POST_IMAGES.design[2]], hashtags: ['poster', 'events', 'design'], helpCategoryIds: ['design-1'], authorId: ama.id } }),
    prisma.post.create({ data: { title: 'Mock Interview Coaching', description: 'Practice with real behavioral and technical questions. Get honest feedback and tips on confidence, structure, and delivery. Sessions are 60 minutes.', tag: 'Service', price: { type: 'fixed', amount: 35 }, images: [POST_IMAGES.career[1]], hashtags: ['interview', 'career', 'coaching'], helpCategoryIds: ['career-2'], authorId: abena.id } }),
    prisma.post.create({ data: { title: 'GitHub Portfolio Setup', description: 'I will clean up your GitHub profile, write proper READMEs, and deploy your portfolio site. Recruiters will notice the difference.', tag: 'Service', price: { type: 'fixed', amount: 60 }, images: [POST_IMAGES.tech[2]], hashtags: ['github', 'portfolio', 'career'], helpCategoryIds: ['tech-3'], authorId: efua.id } }),

    // Request posts by regular users
    prisma.post.create({ data: { title: 'Need Help with Statistics Assignment', description: 'I have a regression analysis assignment due next Friday and I am completely lost on the interpretation part. Looking for someone patient who can explain as we go.', tag: 'Request', price: { type: 'hourly', amount: 20 }, images: [], hashtags: ['statistics', 'help', 'assignment'], helpCategoryIds: ['tutoring-2', 'tutoring-3'], authorId: testUser.id } }),
    prisma.post.create({ data: { title: 'Looking for a Figma Designer for App Idea', description: 'I have an idea for a campus carpooling app and need wireframes and a prototype to pitch to my professor. Budget is flexible for the right person.', tag: 'Request', price: { type: 'fixed', amount: 100 }, images: [], hashtags: ['figma', 'design', 'app'], helpCategoryIds: ['design-2'], authorId: yaw.id } }),
    prisma.post.create({ data: { title: 'Need Someone to Help Me Move Out', description: 'Moving out of Block C this Saturday. Have about 10 boxes and a mini fridge. Will tip well if you bring a trolley.', tag: 'Request', price: { type: 'fixed', amount: 30 }, images: [POST_IMAGES.campus[1]], hashtags: ['moving', 'campus', 'help'], helpCategoryIds: ['campus-2'], authorId: testUser.id } }),
    prisma.post.create({ data: { title: 'Personal Statement Review for Masters Application', description: 'Applying to a Masters in Data Science. Need someone with strong writing skills to review my personal statement and give honest feedback.', tag: 'Request', price: { type: 'fixed', amount: 40 }, images: [], hashtags: ['personalstatement', 'writing', 'masters'], helpCategoryIds: ['career-3', 'tutoring-2'], authorId: yaw.id } }),
  ]);
  console.log('✅ Posts seeded');

  const [postBrand, postCalc, postResume, postErrand, postBug, postPoster, postInterview, postGithub, postStats, postFigma, postMove, postStatement] = posts;

  // ─── 6. SERVICE REQUESTS ───────────────────────────────────────────────────
  // completed — has review
  const srCompleted = await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: kwame.id, postId: postCalc.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.completed, message: 'Hi, I need help with my calculus exam next week.', acceptedAt: new Date(Date.now() - 7 * 86400000), completionRequestedAt: new Date(Date.now() - 2 * 86400000), completedAt: new Date(Date.now() - 86400000) },
  });

  // active — in progress
  const srActive = await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: ama.id, postId: postBrand.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.active, message: 'I need a logo for my student org. Can you help?', acceptedAt: new Date(Date.now() - 3 * 86400000) },
  });

  // pending — awaiting provider accept
  const srPending = await prisma.serviceRequest.create({
    data: { requesterId: yaw.id, providerId: abena.id, postId: postResume.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.pending, message: 'Please review my resume for a summer internship application.' },
  });

  // pending_review — completion requested, awaiting client confirm
  const srPendingReview = await prisma.serviceRequest.create({
    data: { requesterId: yaw.id, providerId: kofi.id, postId: postErrand.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.pending_review, message: 'Can you pick up my textbook from the library?', acceptedAt: new Date(Date.now() - 4 * 86400000), completionRequestedAt: new Date(Date.now() - 3600000) },
  });

  // declined
  await prisma.serviceRequest.create({
    data: { requesterId: yaw.id, providerId: efua.id, postId: postBug.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.declined, message: 'I need help debugging my Python script.' },
  });

  // cancelled
  await prisma.serviceRequest.create({
    data: { requesterId: testUser.id, providerId: abena.id, postId: postInterview.id, kind: ServiceRequestKind.service, status: ServiceRequestStatus.cancelled, message: 'I want to practice for my Google interview.', acceptedAt: new Date(Date.now() - 5 * 86400000) },
  });

  console.log('✅ Service requests seeded');

  // ─── 7. REVIEWS ────────────────────────────────────────────────────────────
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: kwame.id, rating: 5, comment: 'Kwame is an incredible tutor. He broke down integration by parts in a way that finally made sense. Passed my exam with a B+!', serviceTitle: 'Calculus Tutoring — All Levels', serviceRequestId: srCompleted.id },
  });

  // Additional reviews on providers (no service request — historical)
  await prisma.review.create({
    data: { reviewerId: yaw.id, revieweeId: ama.id, rating: 5, comment: 'Ama delivered the poster design ahead of schedule and the quality was incredible. Will definitely use again for our next event.', serviceTitle: 'Event Poster Design' },
  });
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: ama.id, rating: 4, comment: 'Great designer. The logo needed one extra revision but the final result was exactly what I wanted.', serviceTitle: 'Professional Logo & Brand Kit' },
  });
  await prisma.review.create({
    data: { reviewerId: yaw.id, revieweeId: abena.id, rating: 5, comment: 'Abena completely transformed my resume. Got three interview calls the week after sending it out.', serviceTitle: 'Resume Review & Rewrite' },
  });
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: efua.id, rating: 5, comment: 'Found the bug in 20 minutes that I had been staring at for two days. Absolute lifesaver before my deadline.', serviceTitle: 'Code Debugging Session' },
  });
  await prisma.review.create({
    data: { reviewerId: yaw.id, revieweeId: kofi.id, rating: 4, comment: 'Kofi picked up my groceries and was at my door in under an hour. Very communicative throughout.', serviceTitle: 'Same-Day Errand Run' },
  });
  await prisma.review.create({
    data: { reviewerId: testUser.id, revieweeId: kwame.id, rating: 5, comment: 'Second session was even better. Helped me understand hypothesis testing from scratch.', serviceTitle: 'Statistics Study Group' },
  });

  console.log('✅ Reviews seeded');

  // ─── 8. CHAT MESSAGES ──────────────────────────────────────────────────────
  // Thread: testUser ↔ kwame (completed service)
  await prisma.chatMessage.createMany({
    data: [
      { senderId: testUser.id, receiverId: kwame.id, content: 'Hi Kwame! I saw your calculus tutoring post. I have an exam in 10 days and really need help.', postId: postCalc.id, kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 8 * 86400000) },
      { senderId: kwame.id, receiverId: testUser.id, content: 'Hey Alex! Sure, I can help. Which topics are you struggling with most?', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 8 * 86400000 + 300000) },
      { senderId: testUser.id, receiverId: kwame.id, content: 'Mostly integration by parts and u-substitution. I get lost when they combine both.', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 8 * 86400000 + 600000) },
      { senderId: kwame.id, receiverId: testUser.id, content: 'Perfect, those are very fixable! Let us do a 2-hour session this Saturday. I will bring practice problems.', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 7 * 86400000) },
      { senderId: testUser.id, receiverId: kwame.id, content: 'Saturday works great. Should we meet at the library?', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 7 * 86400000 + 3600000) },
      { senderId: kwame.id, receiverId: testUser.id, content: '✅ Service request has been sent. I will confirm once I accept.', kind: MessageKind.system, isRead: true, createdAt: new Date(Date.now() - 7 * 86400000 + 3700000) },
      { senderId: kwame.id, receiverId: testUser.id, content: 'Session accepted! See you Saturday at the library, second floor study rooms.', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 6 * 86400000) },
      { senderId: testUser.id, receiverId: kwame.id, content: 'Thank you so much! That session was genuinely helpful. I finally understand the chain rule properly.', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 86400000) },
      { senderId: kwame.id, receiverId: testUser.id, content: 'Great work putting in the effort! Let me know if you need anything before the exam.', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 82800000) },
    ],
  });

  // Thread: testUser ↔ ama (active service)
  await prisma.chatMessage.createMany({
    data: [
      { senderId: testUser.id, receiverId: ama.id, content: 'Hi Ama! I need a logo for my CS student club. We are called "BuildSpace".', postId: postBrand.id, kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 4 * 86400000) },
      { senderId: ama.id, receiverId: testUser.id, content: 'Love the name! What vibe are you going for — techy and minimal, or bold and colourful?', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 4 * 86400000 + 1800000) },
      { senderId: testUser.id, receiverId: ama.id, content: 'Techy and minimal for sure. Maybe dark background with a clean icon.', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 3 * 86400000) },
      { senderId: ama.id, receiverId: testUser.id, content: 'Perfect, that is my favourite style to work in. I will send you 3 concepts by Thursday.', kind: MessageKind.text, isRead: false, createdAt: new Date(Date.now() - 3 * 86400000 + 3600000) },
    ],
  });

  // Thread: yaw ↔ abena (pending request)
  await prisma.chatMessage.createMany({
    data: [
      { senderId: yaw.id, receiverId: abena.id, content: 'Hello Abena, I saw your resume review post. I am applying for summer internships and really need help.', postId: postResume.id, kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 2 * 86400000) },
      { senderId: abena.id, receiverId: yaw.id, content: 'Hi Yaw! Happy to help. Send me your current resume and the role you are targeting.', kind: MessageKind.text, isRead: true, createdAt: new Date(Date.now() - 2 * 86400000 + 3600000) },
      { senderId: yaw.id, receiverId: abena.id, content: 'I have sent a service request. My resume is a bit all over the place, I will be honest!', kind: MessageKind.text, isRead: false, createdAt: new Date(Date.now() - 86400000) },
    ],
  });

  console.log('✅ Chat messages seeded');

  // ─── 9. NOTIFICATIONS ──────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      // testUser notifications
      { userId: testUser.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: testUser.id, kind: NotificationKind.message, title: 'New message from Ama Owusu', body: 'Perfect, that is my favourite style to work in. I will send you 3 concepts by Thursday.', read: false, data: { type: 'message', username: 'amaowusu' } },
      { userId: testUser.id, kind: NotificationKind.service, title: 'Service request accepted', body: 'Kwame Asante accepted your calculus tutoring request. You are all set for Saturday!', read: true, data: { type: 'service', serviceRequestId: srCompleted.id } },
      { userId: testUser.id, kind: NotificationKind.service, title: 'Service completed', body: 'Your tutoring session with Kwame Asante has been marked complete. Leave a review!', read: false, data: { type: 'service', serviceRequestId: srCompleted.id } },

      // kwame notifications
      { userId: kwame.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: kwame.id, kind: NotificationKind.request, title: 'New service request', body: 'Alex Mensah has requested your calculus tutoring service.', read: true, data: { type: 'request', serviceRequestId: srCompleted.id } },
      { userId: kwame.id, kind: NotificationKind.message, title: 'New message from Alex Mensah', body: 'Thank you so much! That session was genuinely helpful.', read: false, data: { type: 'message', username: 'alexmensah' } },

      // ama notifications
      { userId: ama.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: ama.id, kind: NotificationKind.request, title: 'New service request', body: 'Alex Mensah wants a logo designed for their student club BuildSpace.', read: false, data: { type: 'request', serviceRequestId: srActive.id } },

      // abena notifications
      { userId: abena.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: abena.id, kind: NotificationKind.request, title: 'New service request', body: 'Yaw Darko has requested your resume review service.', read: false, data: { type: 'request', serviceRequestId: srPending.id } },

      // kofi notifications
      { userId: kofi.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: kofi.id, kind: NotificationKind.service, title: 'Completion confirmed', body: 'Yaw Darko confirmed your errand run is complete. Well done!', read: false, data: { type: 'service', serviceRequestId: srPendingReview.id } },

      // yaw notifications
      { userId: yaw.id, kind: NotificationKind.system, title: 'Welcome to PUConnect 🎉', body: 'You are all set! Browse services, connect with providers, and start collaborating with peers on campus.', read: true, data: { type: 'system' } },
      { userId: yaw.id, kind: NotificationKind.service, title: 'Service request declined', body: 'Efua Darkwa has declined your debugging request. You can find another provider on the market.', read: false, data: { type: 'service', serviceRequestId: srPendingReview.id } },
      { userId: yaw.id, kind: NotificationKind.message, title: 'New message from Abena Frimpong', body: 'Hi Yaw! Happy to help. Send me your current resume and the role you are targeting.', read: true, data: { type: 'message', username: 'abenafrimpong' } },
    ],
  });
  console.log('✅ Notifications seeded');

  // ─── DONE ──────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete! Test account: alex@puconnect.app / Test1234!');
  console.log('Other accounts (all password: Test1234!):');
  console.log('  ama@puconnect.app      — provider, Design');
  console.log('  kwame@puconnect.app    — provider, Tutoring');
  console.log('  abena@puconnect.app    — provider, Career');
  console.log('  kofi@puconnect.app     — provider, Campus');
  console.log('  efua@puconnect.app     — provider, Tech');
  console.log('  yaw@puconnect.app      — regular user');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());