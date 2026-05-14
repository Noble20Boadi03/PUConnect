/**
 * MOCK API — All backend calls are disabled for UI/UX testing.
 * To re-enable, restore this file from version control.
 */

import { AuthTokens, Listing, User, ChatMessage, Review, ConversationLifecycle } from '../types';
import { GLOBAL_FILTERS, SUBCATEGORY_FILTERS } from '../constants/filters';

// ──────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────

/** Template for mock data; live session user is `mockSessionUser` (Seeker by default). */
const MOCK_USER: User = {
    id: 'user-001',
    email: 'k.owusu@pu.edu.gh',
    fullName: 'Kwame Owusu-Ansah',
    username: 'kowusu',
    universityId: 'PU20250912',
    role: 'student',
    isActive: true,
    bio: 'Final year Computer Engineering student. Tech enthusiast, part-time Python tutor, and aspiring full-stack developer. Let\'s build something great!',
    skillTags: ['Python', 'React Native', 'Data Structures', 'Technical Writing'],
    experienceLevel: 'intermediate',
    portfolioLinks: ['https://github.com/kowusu'],
    isAvailable: true,
    profilePictureUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    reputationScore: 4.8,
    completedProjects: 12,
    verifiedStudent: true,
    canOfferServices: true,
    createdAt: '2024-09-12T10:00:00Z',
    updatedAt: new Date().toISOString(),
};

let mockSessionUser: User = { ...MOCK_USER };

const MOCK_LISTINGS: Listing[] = [
    {
        id: 'listing-001',
        title: 'Professional Graphic Design & Branding',
        description: 'Get high-quality logos, flyers, and social media banners for your campus startup or event. I specialize in minimalist and modern designs that stand out. Fast delivery and unlimited revisions.',
        price: 50,
        priceType: 'starting_at',
        category: 'Media & Music',
        subcategory: 'Graphic Design',
        type: 'service_offer',
        ownerId: 'user-002',
        media_urls: [
            'https://images.unsplash.com/photo-1572044162444-ad60f128bde2?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop'
        ],
        isActive: true,
        tags: ['graphic design', 'logo', 'branding', 'flyer'],
        level: 'expert',
        average_rating: 4.9,
        review_count: 28,
        createdAt: '2026-03-15T08:30:00Z',
        updatedAt: '2026-03-15T08:30:00Z',
    },
    {
        id: 'listing-002',
        title: 'Calculus I & II Peer Tutoring',
        description: 'Struggling with limits, derivatives, or integration? I offer personalized one-on-one tutoring sessions to help you ace your math exams. Simplified explanations and practice problems included.',
        price: 25,
        priceType: 'fixed',
        category: 'Academics & Language',
        subcategory: 'Subject Tutoring',
        type: 'service_offer',
        ownerId: 'user-003',
        media_urls: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['math', 'calculus', 'tutoring', 'exams'],
        level: 'expert',
        average_rating: 4.7,
        review_count: 45,
        createdAt: '2026-04-10T14:20:00Z',
        updatedAt: '2026-04-10T14:20:00Z',
    },
    {
        id: 'listing-003',
        title: 'Mobile App Development (React Native)',
        description: 'Need a mobile app for your project or business? I can help you build cross-platform apps using React Native. From UI design to API integration, I handle it all.',
        price: 200,
        priceType: 'starting_at',
        category: 'Tech & Creative',
        subcategory: 'Website & App Development',
        type: 'service_offer',
        ownerId: 'user-004',
        media_urls: [
            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop'
        ],
        isActive: true,
        tags: ['mobile', 'app', 'react native', 'coding'],
        level: 'expert',
        average_rating: 5.0,
        review_count: 10,
        createdAt: '2026-05-01T11:45:00Z',
        updatedAt: '2026-05-01T11:45:00Z',
    },
    {
        id: 'listing-004',
        title: 'Campus Errand & Delivery Service',
        description: 'Need something from the market or a different hostel? I offer fast and reliable errand runs and campus deliveries. From food to laundry, I\'ve got you covered.',
        price: 10,
        priceType: 'fixed',
        category: 'Campus & Lifestyle',
        subcategory: 'Campus Delivery',
        type: 'service_offer',
        ownerId: 'user-005',
        media_urls: ['https://images.unsplash.com/photo-1582733775062-ebad21bc0ab2?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['errands', 'delivery', 'campus life', 'convenience'],
        level: 'beginner',
        average_rating: 4.6,
        review_count: 72,
        createdAt: '2026-05-08T09:00:00Z',
        updatedAt: '2026-05-08T09:00:00Z',
    },
    {
        id: 'listing-005',
        title: 'Professional Event Photography',
        description: 'Capture your special moments with high-quality photography. I cover club events, birthday parties, and graduation ceremonies. Professional editing included in all packages.',
        price: 80,
        priceType: 'starting_at',
        category: 'Media & Music',
        subcategory: 'Event Photography/Video',
        type: 'service_offer',
        ownerId: 'user-006',
        media_urls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['photography', 'event', 'photoshoot', 'memories'],
        level: 'intermediate',
        average_rating: 4.8,
        review_count: 18,
        createdAt: '2026-05-03T16:30:00Z',
        updatedAt: '2026-05-03T16:30:00Z',
    },
    {
        id: 'listing-006',
        title: 'CV & Cover Letter Writing',
        description: 'Apply for internships and jobs with confidence! I help you craft professional CVs and cover letters that highlight your skills and experience. Personalized for your target role.',
        price: 30,
        priceType: 'fixed',
        category: 'Business & Career',
        subcategory: 'CV & Cover Letters',
        type: 'service_offer',
        ownerId: 'user-007',
        media_urls: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['career', 'cv', 'resume', 'internship'],
        level: 'intermediate',
        average_rating: 4.7,
        review_count: 38,
        createdAt: '2026-05-05T13:10:00Z',
        updatedAt: '2026-05-05T13:10:00Z',
    },
    {
        id: 'listing-007',
        title: 'Social Media Management for Campus Brands',
        description: 'Grow your campus brand or club presence on social media. I offer content creation, posting schedules, and engagement strategies for Instagram, TikTok, and Twitter.',
        price: 60,
        priceType: 'starting_at',
        category: 'Media & Music',
        subcategory: 'Video Editing & Content',
        type: 'service_offer',
        ownerId: 'user-008',
        media_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['social media', 'marketing', 'content creation', 'branding'],
        level: 'intermediate',
        average_rating: 4.5,
        review_count: 22,
        createdAt: '2026-04-28T10:45:00Z',
        updatedAt: '2026-04-28T10:45:00Z',
    },
    {
        id: 'listing-008',
        title: 'Custom Beat Production (Afrobeats & Hip-Hop)',
        description: 'Need a unique beat for your next track? I produce high-quality Afrobeats, Hip-Hop, and Trap instrumentals. Mixing and mastering services also available.',
        price: 100,
        priceType: 'starting_at',
        category: 'Media & Music',
        subcategory: 'Graphic Design',
        type: 'service_offer',
        ownerId: 'user-009',
        media_urls: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['music production', 'beats', 'afrobeats', 'studio'],
        level: 'expert',
        average_rating: 4.9,
        review_count: 14,
        createdAt: '2026-05-09T15:20:00Z',
        updatedAt: '2026-05-09T15:20:00Z',
    },
    {
        id: 'listing-009',
        title: 'Hostel Hair Braiding & Styling',
        description: 'Get your hair done in the comfort of your hostel. I offer various braiding styles including knotless, cornrows, and twists. Affordable prices and professional results.',
        price: 45,
        priceType: 'starting_at',
        category: 'Campus & Lifestyle',
        subcategory: 'Beauty & Personal Care',
        type: 'service_offer',
        ownerId: 'user-010',
        media_urls: ['https://images.unsplash.com/photo-1643185539104-3622dd1f0ff6?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['hair', 'braiding', 'beauty', 'hostel service'],
        level: 'intermediate',
        average_rating: 4.8,
        review_count: 12,
        createdAt: '2026-05-11T18:00:00Z',
        updatedAt: '2026-05-11T18:00:00Z',
    },
    {
        id: 'listing-010',
        title: 'Academic French-English Translation',
        description: 'Accurate translation for research papers, essays, and presentations. I ensure that your academic work maintains its original meaning and tone in both languages.',
        price: 20,
        priceType: 'fixed',
        category: 'Academics & Language',
        subcategory: 'Translation',
        type: 'service_offer',
        ownerId: 'user-011',
        media_urls: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['french', 'translation', 'academic', 'language'],
        level: 'expert',
        average_rating: 4.9,
        review_count: 30,
        createdAt: '2026-04-20T09:30:00Z',
        updatedAt: '2026-04-20T09:30:00Z',
    },
    // --- Need-help Posts (NPs / Seeker Listings) ---
    {
        id: 'np-001',
        title: 'Need Urgent Help with Python Project',
        description: 'I\'m working on a data analysis project in Python and I\'m stuck with some pandas and matplotlib issues. Need someone to help me debug and finish it by tomorrow morning.',
        budget: 40,
        priceType: 'fixed',
        category: 'Tech & Creative',
        subcategory: 'Software Engineering Support',
        type: 'service_request',
        ownerId: 'user-001',
        media_urls: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['python', 'pandas', 'debugging', 'urgent'],
        requiredSkills: ['Python', 'Data Analysis'],
        createdAt: '2026-05-14T02:00:00Z',
        updatedAt: '2026-05-14T02:00:00Z',
    },
    {
        id: 'np-002',
        title: 'Looking for a Keyboardist for Church Band',
        description: 'Our campus church band is looking for a skilled keyboardist for Sunday services and midweek rehearsals. Experience with contemporary gospel music is a plus.',
        budget: 0,
        priceType: 'negotiable',
        category: 'Media & Music',
        subcategory: 'Video Editing & Content',
        type: 'service_request',
        ownerId: 'user-009',
        media_urls: ['https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['music', 'keyboard', 'church band', 'gospel'],
        requiredSkills: ['Keyboard', 'Musical Theory'],
        createdAt: '2026-05-13T10:00:00Z',
        updatedAt: '2026-05-13T10:00:00Z',
    },
    {
        id: 'np-003',
        title: 'Photographer Needed for Hall Week Dinner',
        description: 'We need a photographer to cover our Hall Week Dinner next Friday. Coverage for about 4 hours, and we need the digital photos within a week.',
        budget: 100,
        priceType: 'fixed',
        category: 'Media & Music',
        subcategory: 'Event Photography/Video',
        type: 'service_request',
        ownerId: 'user-007',
        media_urls: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop'],
        isActive: true,
        tags: ['photography', 'event', 'dinner', 'hall week'],
        requiredSkills: ['Photography', 'Event Coverage'],
        createdAt: '2026-05-12T15:30:00Z',
        updatedAt: '2026-05-12T15:30:00Z',
    },
];

const MOCK_MESSAGES: ChatMessage[] = [
    // ── Conversation with Abena Appiah (Listing: Professional Graphic Design & Branding) ────
    {
        id: 'msg-001',
        senderId: 'user-002',
        senderName: 'Abena Appiah',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        receiverId: 'user-001',
        peerId: 'user-002',
        listingId: 'listing-001',
        listingTitle: 'Professional Graphic Design & Branding',
        listingThumbnail: 'https://images.unsplash.com/photo-1572044162444-ad60f128bde2?w=200&auto=format&fit=crop',
        message: 'Hi Kwame! I saw your request for a startup logo. I\'d love to help you with that. Do you have a color palette in mind?',
        isRead: true,
        createdAt: '2026-05-13T14:20:00Z',
        updatedAt: '2026-05-13T14:20:00Z',
    },
    {
        id: 'msg-001-reply-1',
        senderId: 'user-001',
        senderName: 'Me',
        receiverId: 'user-002',
        peerId: 'user-002',
        listingId: 'listing-001',
        listingTitle: 'Professional Graphic Design & Branding',
        message: 'Hey Abena! Yes, I was thinking of something with deep blues and maybe a touch of gold for a premium look.',
        isRead: true,
        createdAt: '2026-05-13T14:45:00Z',
        updatedAt: '2026-05-13T14:45:00Z',
    },
    {
        id: 'msg-001-reply-2',
        senderId: 'user-002',
        senderName: 'Abena Appiah',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        receiverId: 'user-001',
        peerId: 'user-002',
        listingId: 'listing-001',
        listingTitle: 'Professional Graphic Design & Branding',
        message: 'That sounds elegant. I\'ll put together a few concepts and send them over by tomorrow evening.',
        isRead: true,
        createdAt: '2026-05-13T15:10:00Z',
        updatedAt: '2026-05-13T15:10:00Z',
    },

    // ── Conversation with Kofi Osei (Listing: Calculus I & II Peer Tutoring) ───────
    {
        id: 'msg-002',
        senderId: 'user-003',
        senderName: 'Kofi Osei',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        receiverId: 'user-001',
        peerId: 'user-003',
        listingId: 'listing-002',
        listingTitle: 'Calculus I & II Peer Tutoring',
        listingThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&auto=format&fit=crop',
        message: 'Hey Kwame, are we still on for the integration session this Friday? I\'ve prepared some practice problems.',
        isRead: true,
        createdAt: '2026-05-14T09:00:00Z',
        updatedAt: '2026-05-14T09:00:00Z',
    },

    // ── Conversation with Ekow Mensah (Listing: Campus Errand & Delivery Service) ──────────
    {
        id: 'msg-003',
        senderId: 'user-005',
        senderName: 'Ekow Mensah',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        receiverId: 'user-001',
        peerId: 'user-005',
        listingId: 'listing-004',
        listingTitle: 'Campus Errand & Delivery Service',
        listingThumbnail: 'https://images.unsplash.com/photo-1582733775062-ebad21bc0ab2?w=200&auto=format&fit=crop',
        message: 'Just picked up your laundry, Kwame. I should be at your hostel gate in about 15 minutes.',
        isRead: false,
        createdAt: '2026-05-14T11:15:00Z',
        updatedAt: '2026-05-14T11:15:00Z',
    },
];

const MOCK_TALENT: User[] = [
    { ...MOCK_USER, id: 'talent-001', fullName: 'Ama Mensah', username: 'amensah', skillTags: ['Illustration', 'Branding', 'Figma'], createdAt: '2026-01-10T10:00:00Z', updatedAt: new Date().toISOString() },
    { ...MOCK_USER, id: 'talent-002', fullName: 'Kwame Asante', username: 'kasante', skillTags: ['Python', 'Machine Learning', 'Data Science'], createdAt: '2026-02-15T10:00:00Z', updatedAt: new Date().toISOString() },
    { ...MOCK_USER, id: 'talent-003', fullName: 'Nana Yaa Boateng', username: 'nyboateng', skillTags: ['Marketing', 'Social Media', 'Copywriting'], createdAt: '2026-03-20T10:00:00Z', updatedAt: new Date().toISOString() },
];

/** Synthetic campus users backing listing `ownerId`s (public profiles + chat headers). */
const MOCK_PEER_USERS: Record<string, User> = {
    'user-002': { ...MOCK_USER, id: 'user-002', fullName: 'Abena Appiah', username: 'aappiah', email: 'a.appiah@pu.edu.gh', universityId: 'PU2024002', skillTags: ['Graphic Design', 'Branding', 'Adobe Suite', 'UI Design'], bio: 'Passionate about creating visual stories that resonate. I love helping campus brands find their identity.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
    'user-003': { ...MOCK_USER, id: 'user-003', fullName: 'Kofi Osei', username: 'kosei', email: 'k.osei@pu.edu.gh', universityId: 'PU2024003', skillTags: ['Calculus', 'Linear Algebra', 'Statistics'], bio: 'Math doesn\'t have to be hard. I specialize in breaking down complex topics for my peers.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    'user-004': { ...MOCK_USER, id: 'user-004', fullName: 'Yaw Dankwa', username: 'ydankwa', email: 'y.dankwa@pu.edu.gh', universityId: 'PU2024004', skillTags: ['React Native', 'Expo', 'TypeScript', 'Node.js'], bio: 'Full-stack developer building tools for students. Let\'s collaborate on your next big idea.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop' },
    'user-005': { ...MOCK_USER, id: 'user-005', fullName: 'Ekow Mensah', username: 'emensah', email: 'e.mensah@pu.edu.gh', universityId: 'PU2024005', skillTags: ['Delivery', 'Time Management', 'Customer Relations'], bio: 'Your reliable partner for campus errands. Fast, safe, and always on time.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
    'user-006': { ...MOCK_USER, id: 'user-006', fullName: 'Akua Agyemang', username: 'aagyemang', email: 'a.agyemang@pu.edu.gh', universityId: 'PU2024006', skillTags: ['Photography', 'Editing', 'Storytelling'], bio: 'Capturing the spirit of campus life one frame at a time. Available for all your photography needs.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' },
    'user-007': { ...MOCK_USER, id: 'user-007', fullName: 'Papa Boateng', username: 'pboateng', email: 'p.boateng@pu.edu.gh', universityId: 'PU2024007', skillTags: ['CV Writing', 'Proofreading', 'Copywriting'], bio: 'Helping you present your best self to employers. Expert in academic and professional writing.', canOfferServices: true },
    'user-008': { ...MOCK_USER, id: 'user-008', fullName: 'Araba Owusu', username: 'aowusu', email: 'a.owusu@pu.edu.gh', universityId: 'PU2024008', skillTags: ['Social Media', 'Content Strategy', 'Public Relations'], bio: 'Digital native helping campus clubs and brands grow their online presence.', canOfferServices: true },
    'user-009': { ...MOCK_USER, id: 'user-009', fullName: 'Kwabena Asante', username: 'kasante_music', email: 'k.asante@pu.edu.gh', universityId: 'PU2024009', skillTags: ['Music Production', 'Mixing', 'Beat Making'], bio: 'Producer and sound engineer. Let\'s make some music that moves people.', canOfferServices: true },
    'user-010': { ...MOCK_USER, id: 'user-010', fullName: 'Afua Dankwa', username: 'adankwa', email: 'a.dankwa@pu.edu.gh', universityId: 'PU2024010', skillTags: ['Hair Braiding', 'Styling', 'Beauty'], bio: 'Expert hair braiding in the hostel. Looking good shouldn\'t be stressful.', canOfferServices: true },
    'user-011': { ...MOCK_USER, id: 'user-011', fullName: 'Esi Osei', username: 'eosei', email: 'e.osei@pu.edu.gh', universityId: 'PU2024011', skillTags: ['French', 'Translation', 'Linguistics'], bio: 'Bilingual student helping with all your French-English translation needs.', canOfferServices: true },
};

let extraListings: Listing[] = [];

const conversationLifecycle: Record<string, ConversationLifecycle> = {};

const submittedReviews: Review[] = [
    {
        id: 'review-seed-001',
        listingId: 'listing-001',
        authorUserId: 'user-001',
        targetUserId: 'user-002',
        rating: 5,
        comment: 'Abena is a talented designer! She really captured the essence of my brand with the logo she created. Highly recommend her services.',
        createdAt: '2026-05-10T14:20:00Z',
    },
    {
        id: 'review-seed-002',
        listingId: 'listing-001',
        authorUserId: 'user-005',
        targetUserId: 'user-002',
        rating: 5,
        comment: 'Amazing work on the flyers for our hall week event. Everyone loved them!',
        createdAt: '2026-05-05T10:00:00Z',
    },
    {
        id: 'review-seed-003',
        listingId: 'listing-002',
        authorUserId: 'user-001',
        targetUserId: 'user-003',
        rating: 5,
        comment: 'Kofi is an excellent tutor. He made integration so much easier to understand. I feel much more confident about my math quiz now.',
        createdAt: '2026-05-12T09:30:00Z',
    },
];

function convKey(me: string, peer: string, listingId?: string): string {
    const [a, b] = [me, peer].sort();
    return `${a}|${b}|${listingId ?? ''}`;
}

function allListingsMerged(): Listing[] {
    return [...MOCK_LISTINGS, ...extraListings].map(listing => {
        const owner = MOCK_PEER_USERS[listing.ownerId] || (listing.ownerId === mockSessionUser.id ? mockSessionUser : MOCK_USER);
        return {
            ...listing,
            ownerName: owner.fullName,
            ownerAvatar: owner.profilePictureUrl,
        };
    });
}

// ──────────────────────────────────────────────
// Simulated delay to mimic network latency
// ──────────────────────────────────────────────
const delay = (ms: number = 300, signal?: AbortSignal) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, ms);

        if (signal) {
            if (signal.aborted) {
                clearTimeout(timeout);
                reject(new Error('Aborted'));
            }

            signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Aborted'));
            });
        }
    });
};

// ──────────────────────────────────────────────
// Mock API (no network calls)
// ──────────────────────────────────────────────

export const getApiUrl = () => 'http://localhost:8000/api/v1';

export const api = {
    // Auth
    login: async (_email: string, _password: string): Promise<AuthTokens> => {
        await delay();
        return { access_token: 'mock_token', refresh_token: 'mock_refresh', token_type: 'bearer' };
    },

    register: async (_userData: any): Promise<User> => {
        await delay();
        return MOCK_USER;
    },

    getMe: async (_token: string, signal?: AbortSignal): Promise<User> => {
        await delay(300, signal);
        return { ...mockSessionUser };
    },

    updateProfile: async (profileData: Partial<User>, _token: string): Promise<User> => {
        await delay();
        mockSessionUser = { ...mockSessionUser, ...profileData, updatedAt: new Date().toISOString() };
        return { ...mockSessionUser };
    },

    getTalent: async (_search: string = '', _skip: number = 0, _limit: number = 10): Promise<User[]> => {
        await delay();
        return MOCK_TALENT;
    },

    getSkillGaps: async (): Promise<any> => {
        await delay();
        return { gaps: ['Data Analysis', 'UI/UX Research', 'Cloud DevOps'] };
    },

    getProvidersBySubcategory: async (subcategory: string, signal?: AbortSignal): Promise<any[]> => {
        await delay(350, signal);
        
        // 1. Find all listings in this subcategory
        const listings = allListingsMerged().filter(l => 
            l.isActive && 
            l.subcategory?.toLowerCase() === subcategory.toLowerCase()
        );

        if (listings.length === 0) {
            // Fallback for demo: return a few random providers if no listings exist for this subcategory
            const talentPool = Object.values(MOCK_PEER_USERS).filter(u => u.canOfferServices);
            return talentPool.slice(0, 3).map(u => ({
                ...u,
                startingPrice: 50 // Default mock price
            }));
        }

        // 2. Group by owner and find minimum price
        const providerMap: Record<string, { user: User, minPrice: number }> = {};
        
        listings.forEach(l => {
            const currentMin = providerMap[l.ownerId]?.minPrice ?? Infinity;
            const price = l.price ?? l.budget ?? 0;
            const user = MOCK_PEER_USERS[l.ownerId] || MOCK_USER;
            
            if (price < currentMin) {
                providerMap[l.ownerId] = { user, minPrice: price };
            } else if (!providerMap[l.ownerId]) {
                 providerMap[l.ownerId] = { user, minPrice: price };
            }
        });

        // 3. Return as flat array with startingPrice attached
        return Object.values(providerMap).map(p => ({
            ...p.user,
            startingPrice: p.minPrice
        }));
    },

    // Listings
    getListings: async (
        _skip = 0,
        _limit = 10,
        _filters?: {
            category?: string;
            subcategory?: string;
            tag?: string;
            level?: string;
            type?: 'service_offer' | 'service_request';
            department?: string;
            minPrice?: number;
            maxPrice?: number;
            sortBy?: string;
        },
        signal?: AbortSignal
    ): Promise<Listing[]> => {
        await delay(400, signal);
        let rows = allListingsMerged().filter((l) => l.isActive);
        if (_filters?.category) {
            rows = rows.filter((l) => l.category === _filters.category);
        }
        if (_filters?.subcategory) {
            rows = rows.filter((l) => l.subcategory === _filters.subcategory);
        }
        if (_filters?.tag) {
            const t = _filters.tag.toLowerCase();
            rows = rows.filter((l) => l.tags?.some((x) => x.toLowerCase().includes(t)));
        }
        if (_filters?.level) {
            rows = rows.filter((l) => l.level === _filters.level);
        }
        if (_filters?.type) {
            rows = rows.filter((l) => l.type === _filters.type);
        }
        if (_filters?.minPrice != null) {
            rows = rows.filter((l) => (l.price ?? l.budget ?? 0) >= _filters.minPrice!);
        }
        if (_filters?.maxPrice != null) {
            rows = rows.filter((l) => (l.price ?? l.budget ?? 0) <= _filters.maxPrice!);
        }
        if (_filters?.sortBy === 'price') {
            rows = [...rows].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        } else if (_filters?.sortBy === 'rating') {
            rows = [...rows].sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
        }
        return rows.slice(_skip, _skip + _limit);
    },

    getListing: async (id: string, signal?: AbortSignal): Promise<Listing> => {
        await delay(300, signal);
        const found = allListingsMerged().find((l) => l.id === id);
        if (found) return found;
        return MOCK_LISTINGS[0];
    },

    createListing: async (listingData: Partial<Listing>, _token: string): Promise<Listing> => {
        await delay();
        const now = new Date().toISOString();
        const listing: Listing = {
            ...MOCK_LISTINGS[0],
            ...listingData,
            id: `listing-new-${Date.now()}`,
            ownerId: mockSessionUser.id,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
        extraListings = [listing, ...extraListings];
        return listing;
    },

    updateListing: async (id: string, patch: Partial<Listing>, _token: string): Promise<Listing> => {
        await delay();
        const idx = extraListings.findIndex((l) => l.id === id);
        if (idx < 0) throw new Error('Listing not found or not editable');
        const updated = { ...extraListings[idx], ...patch, updatedAt: new Date().toISOString() };
        extraListings[idx] = updated;
        return updated;
    },

    deleteListing: async (id: string, _token: string): Promise<void> => {
        await delay();
        const idx = extraListings.findIndex((l) => l.id === id);
        if (idx < 0) throw new Error('Listing not found or not removable');
        extraListings[idx] = { ...extraListings[idx], isActive: false, updatedAt: new Date().toISOString() };
    },

    searchListings: async (query: string, signal?: AbortSignal): Promise<Listing[]> => {
        await delay(250, signal);
        const q = query.trim().toLowerCase();
        if (!q) return allListingsMerged().filter((l) => l.isActive).slice(0, 30);
        return allListingsMerged()
            .filter((l) => l.isActive)
            .filter(
                (l) =>
                    l.title.toLowerCase().includes(q) ||
                    (l.description && l.description.toLowerCase().includes(q)) ||
                    l.category.toLowerCase().includes(q) ||
                    (l.subcategory && l.subcategory.toLowerCase().includes(q)) ||
                    (l.tags && l.tags.some((t) => t.toLowerCase().includes(q)))
            )
            .slice(0, 40);
    },

    getUserById: async (id: string, signal?: AbortSignal): Promise<User | null> => {
        await delay(200, signal);
        if (id === MOCK_USER.id) return MOCK_USER;
        return MOCK_PEER_USERS[id] ?? null;
    },

    getListingsByOwner: async (ownerId: string, signal?: AbortSignal): Promise<Listing[]> => {
        await delay(250, signal);
        return allListingsMerged().filter((l) => l.ownerId === ownerId);
    },

    getConversationLifecycle: async (
        meId: string,
        peerId: string,
        listingId: string | undefined,
        _token: string
    ): Promise<ConversationLifecycle> => {
        await delay(100);
        const k = convKey(meId, peerId, listingId);
        return conversationLifecycle[k] ?? 'open';
    },

    setConversationLifecycle: async (
        meId: string,
        peerId: string,
        listingId: string | undefined,
        state: ConversationLifecycle,
        _token: string
    ): Promise<void> => {
        await delay(150);
        const k = convKey(meId, peerId, listingId);
        conversationLifecycle[k] = state;
    },

    submitReview: async (
        payload: { listingId: string; targetUserId: string; rating: number; comment: string },
        _token: string
    ): Promise<Review> => {
        await delay();
        const r: Review = {
            id: `review-${Date.now()}`,
            listingId: payload.listingId,
            authorUserId: mockSessionUser.id,
            targetUserId: payload.targetUserId,
            rating: payload.rating,
            comment: payload.comment,
            createdAt: new Date().toISOString(),
        };
        submittedReviews.push(r);
        
        // Simulate reputation impact
        const peer = MOCK_PEER_USERS[payload.targetUserId];
        if (peer) {
            const currentTotal = (peer.reputationScore ?? 4.5) * (peer.review_count ?? 10);
            const newCount = (peer.review_count ?? 10) + 1;
            const newRating = (currentTotal + payload.rating) / newCount;
            MOCK_PEER_USERS[payload.targetUserId] = {
                ...peer,
                reputationScore: parseFloat(newRating.toFixed(1)),
                review_count: newCount
            };
        }

        return r;
    },

    // Chat
    getMessages: async (_token: string, signal?: AbortSignal): Promise<ChatMessage[]> => {
        await delay(300, signal);
        
        // Group by conversation (other person + listing)
        const groups: Record<string, ChatMessage> = {};
        const myId = mockSessionUser.id;

        MOCK_MESSAGES.forEach(m => {
            const peerId = m.peerId || (m.senderId === myId ? m.receiverId : m.senderId);
            const key = `${peerId}-${m.listingId || 'no-listing'}`;
            
            const messageWithPeer: ChatMessage = {
                ...m,
                // Ensure senderName/Avatar always represent the OTHER person for the Inbox Row UI
                senderName: m.senderId === myId ? (MOCK_PEER_USERS[peerId]?.fullName || 'Me') : m.senderName,
                senderAvatar: m.senderId === myId ? MOCK_PEER_USERS[peerId]?.profilePictureUrl : m.senderAvatar,
                peerId: peerId 
            };

            if (!groups[key] || new Date(m.createdAt) > new Date(groups[key].createdAt)) {
                groups[key] = messageWithPeer;
            }
        });

        return Object.values(groups).sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    getConversation: async (_token: string, userId: string, listingId?: string): Promise<ChatMessage[]> => {
        await delay();
        const myId = mockSessionUser.id;
        // Filter messages between me (mock-user-001) and the target user
        return MOCK_MESSAGES.filter(m => 
            ((m.senderId === userId && m.receiverId === myId) || 
             (m.senderId === myId && m.receiverId === userId)) && 
            (!listingId || m.listingId === listingId)
        );
    },

    sendMessage: async (messageData: { receiver_id: string, listing_id: string, message: string }, _token: string): Promise<ChatMessage> => {
        await delay();
        return {
            id: `msg-new-${Date.now()}`,
            senderId: mockSessionUser.id,
            senderName: mockSessionUser.fullName,
            receiverId: messageData.receiver_id,
            listingId: messageData.listing_id,
            message: messageData.message,
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    },

    uploadImage: async (_uri: string, _token: string): Promise<{ url: string }> => {
        await delay();
        return { url: '/mock/profile-picture.jpg' };
    },

    getSubcategoryFilters: async (_subcategory: string): Promise<any[]> => {
        await delay();

        // Try exact match first
        const cleanSubcategory = _subcategory?.trim() || '';
        let foundFilters: any[] = [];
        if (SUBCATEGORY_FILTERS[cleanSubcategory]) {
            console.log(`[API] Found exact filters for: ${cleanSubcategory}`);
            foundFilters = SUBCATEGORY_FILTERS[cleanSubcategory];
        } else {
            // Try case-insensitive and partial match
            const matchingKey = Object.keys(SUBCATEGORY_FILTERS).find(k => {
                const cleanK = k.toLowerCase().trim();
                const cleanS = cleanSubcategory.toLowerCase();
                return cleanK === cleanS || cleanK.includes(cleanS) || cleanS.includes(cleanK);
            });
            
            if (matchingKey) {
                console.log(`[API] Found partial match filters for: ${cleanSubcategory} (matched with ${matchingKey})`);
                foundFilters = SUBCATEGORY_FILTERS[matchingKey];
            } else {
                console.log(`[API] No filters found for: "${_subcategory}"`);
            }
        }

        return [...GLOBAL_FILTERS, ...foundFilters];
    },

    getReviewsByTargetUser: async (targetUserId: string, signal?: AbortSignal): Promise<Review[]> => {
        await delay(250, signal);
        return submittedReviews
            .filter(r => r.targetUserId === targetUserId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getApiUrl,
};
