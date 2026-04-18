/**
 * MOCK API — All backend calls are disabled for UI/UX testing.
 * To re-enable, restore this file from version control.
 */

import { AuthTokens, Listing, User, ChatMessage, Review, ConversationLifecycle } from '../types';

// ──────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────

/** Template for mock data; live session user is `mockSessionUser` (Seeker by default). */
const MOCK_USER: User = {
    id: 'mock-user-001',
    email: 'jac@university.edu',
    fullName: 'JAC User',
    universityId: '20275892',
    role: 'student',
    isActive: true,
    bio: '',
    skillTags: [],
    experienceLevel: 'beginner',
    portfolioLinks: [],
    isAvailable: true,
    profilePictureUrl: undefined,
    reputationScore: 0.0,
    completedProjects: 0,
    verifiedStudent: true,
    department: 'Business & Economics',
    graduationYear: 2026,
    canOfferServices: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

let mockSessionUser: User = { ...MOCK_USER };

const MOCK_LISTINGS: Listing[] = [
    {
        id: 'listing-001',
        title: 'Professional Logo Design',
        description: 'I will design a modern, minimalist logo for your brand or project. Includes 3 revisions.',
        price: 25,
        category: 'Creative & Design',
        subcategory: 'Logo Design',
        type: 'service_offer',
        ownerId: 'user-002',
        media_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['design', 'branding', 'logo'],
        level: 'intermediate',
        average_rating: 4.9,
        review_count: 23,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-002',
        title: 'Math & Physics Tutoring',
        description: 'One-on-one tutoring sessions for Calculus, Linear Algebra, and Physics.',
        price: 15,
        category: 'Tutoring & Academics',
        subcategory: 'STEM Tutoring',
        type: 'service_offer',
        ownerId: 'user-003',
        media_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['tutoring', 'math', 'physics'],
        level: 'expert',
        average_rating: 4.7,
        review_count: 41,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-003',
        title: 'Mobile App Development',
        description: 'Full-stack mobile app development using React Native and Expo. From concept to deployment.',
        price: 120,
        category: 'Tech & Development',
        subcategory: 'App Development',
        type: 'service_offer',
        ownerId: 'user-004',
        media_url: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['react native', 'mobile', 'development'],
        level: 'expert',
        average_rating: 5.0,
        review_count: 8,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-004',
        title: 'Campus Food Delivery',
        description: 'Fast and reliable food delivery service across campus. Order from any campus restaurant.',
        price: 5,
        category: 'Errands & Delivery',
        subcategory: 'Food Delivery',
        type: 'service_offer',
        ownerId: 'user-005',
        media_url: 'https://images.unsplash.com/photo-1526367790999-015078648402?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['delivery', 'food', 'campus'],
        level: 'beginner',
        average_rating: 4.5,
        review_count: 67,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-005',
        title: 'Photography & Videography',
        description: 'Professional event photography and short-form video content for socials or portfolios.',
        price: 50,
        category: 'Creative & Design',
        subcategory: 'Photography',
        type: 'service_offer',
        ownerId: 'user-006',
        media_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['photography', 'video', 'content'],
        level: 'intermediate',
        average_rating: 4.8,
        review_count: 15,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-006',
        title: 'Resume & Cover Letter Review',
        description: 'Get your resume and cover letter polished by a career-focused peer reviewer.',
        price: 10,
        category: 'Writing & Content',
        subcategory: 'Resume Writing',
        type: 'service_offer',
        ownerId: 'user-007',
        media_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['resume', 'career', 'writing'],
        level: 'intermediate',
        average_rating: 4.6,
        review_count: 34,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-007',
        title: 'Social Media Marketing',
        description: 'Grow your campus brand with targeted social media strategies and content plans.',
        price: 35,
        category: 'Marketing & Promotion',
        subcategory: 'Social Media',
        type: 'service_offer',
        ownerId: 'user-008',
        media_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['marketing', 'social media', 'branding'],
        level: 'intermediate',
        average_rating: 4.4,
        review_count: 19,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-008',
        title: 'Music Production & Beats',
        description: 'Custom beats, mixing, and mastering for your music projects. All genres welcome.',
        price: 40,
        category: 'Creative & Design',
        subcategory: 'Music',
        type: 'service_offer',
        ownerId: 'user-009',
        media_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['music', 'production', 'beats'],
        level: 'expert',
        average_rating: 4.9,
        review_count: 11,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-009',
        title: 'Event Planning & Coordination',
        description: 'Full event planning for campus events, parties, and organization meetings.',
        price: 75,
        category: 'Events & Entertainment',
        subcategory: 'Event Planning',
        type: 'service_offer',
        ownerId: 'user-010',
        media_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['events', 'planning', 'coordination'],
        level: 'intermediate',
        average_rating: 4.7,
        review_count: 9,
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'listing-010',
        title: 'Language Translation Services',
        description: 'Accurate translation between English, French, and Spanish for documents and presentations.',
        price: 20,
        category: 'Writing & Content',
        subcategory: 'Translation',
        type: 'service_offer',
        ownerId: 'user-011',
        media_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['translation', 'language', 'writing'],
        level: 'expert',
        average_rating: 4.8,
        review_count: 27,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    // --- Need-help Posts (NPs / Seeker Listings) ---
    {
        id: 'np-001',
        title: 'Need Help with Calc II Homework',
        description: 'I am struggling with integration by parts and differential equations. Need a 1-hour session.',
        budget: 15,
        category: 'Tutoring & Academics',
        subcategory: 'STEM Tutoring',
        type: 'service_request',
        ownerId: 'mock-user-001',
        media_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['calculus', 'math', 'homework'],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'np-002',
        title: 'Looking for a Guitarist for Band',
        description: 'Our campus band needs a lead guitarist for the upcoming talent show. Rehearsals twice a week.',
        budget: 0,
        category: 'Events & Entertainment',
        subcategory: 'Music',
        type: 'service_request',
        ownerId: 'user-009',
        media_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['music', 'band', 'guitar'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'np-003',
        title: 'Website Bug Fix - Urgently Needed',
        description: 'My portfolio website has some CSS issues on mobile. Need a dev to fix it tonight.',
        budget: 30,
        category: 'Tech & Development',
        subcategory: 'App Development',
        type: 'service_request',
        ownerId: 'user-007',
        media_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
        isActive: true,
        tags: ['web', 'css', 'bug'],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const MOCK_MESSAGES: ChatMessage[] = [
    // ── Conversation with Alex Rivera (Listing: Premium Logo Design) ────
    {
        id: 'msg-001',
        senderId: 'user-002',
        senderName: 'Alex Rivera',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        receiverId: 'mock-user-001',
        listingId: 'listing-001',
        listingTitle: 'Premium Logo Design',
        listingThumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&auto=format&fit=crop',
        message: 'Hey! I saw your listing. Can you do a logo for my startup?',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-001-reply-1',
        senderId: 'mock-user-001',
        senderName: 'Me',
        receiverId: 'user-002',
        listingId: 'listing-001',
        listingTitle: 'Premium Logo Design',
        message: 'Sure! I specialize in startup branding. What kind of vibe are you going for?',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-001-reply-2',
        senderId: 'user-002',
        senderName: 'Alex Rivera',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        receiverId: 'mock-user-001',
        listingId: 'listing-001',
        listingTitle: 'Premium Logo Design',
        message: 'Something modern and minimalist. It is an AI-powered fintech app.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-001-reply-3',
        senderId: 'mock-user-001',
        senderName: 'Me',
        receiverId: 'user-002',
        listingId: 'listing-001',
        listingTitle: 'Premium Logo Design',
        message: 'Got it. I can definitely work with that. Does my standard $50 rate work for you?',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-001-reply-4',
        senderId: 'user-002',
        senderName: 'Alex Rivera',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        receiverId: 'mock-user-001',
        listingId: 'listing-001',
        listingTitle: 'Premium Logo Design',
        message: 'Yes, that is perfect. Just let me know when you can start!',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-001-reply-5',
        senderId: 'mock-user-001',
        senderName: 'Me',
        receiverId: 'user-002',
        listingId: 'listing-001',
        listingTitle: 'Premium Logo Design',
        message: 'I can start today! I will send over the first set of concepts by tomorrow evening.',
        isRead: true,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-001-reply-6',
        senderId: 'user-002',
        senderName: 'Alex Rivera',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        receiverId: 'mock-user-001',
        listingId: 'listing-001',
        listingTitle: 'Premium Logo Design',
        message: 'Great, sounds like a plan. Looking forward to it!',
        isRead: false,
        createdAt: new Date(Date.now() - 600000).toISOString(),
        updatedAt: new Date().toISOString(),
    },

    // ── Conversation with Jordan Kim (Listing: Calc II Tutoring) ───────
    {
        id: 'msg-002',
        senderId: 'user-003',
        senderName: 'Jordan Kim',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        receiverId: 'mock-user-001',
        listingId: 'listing-002',
        listingTitle: 'Calc II Tutoring',
        listingThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&auto=format&fit=crop',
        message: 'Thanks for the tutoring session yesterday, it was really helpful!',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-002-reply-1',
        senderId: 'mock-user-001',
        senderName: 'Me',
        receiverId: 'user-003',
        listingId: 'listing-002',
        listingTitle: 'Calc II Tutoring',
        message: 'You are very welcome, Jordan! Happy I could help clarify those integrals.',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-002-reply-2',
        senderId: 'mock-user-001',
        senderName: 'Me',
        receiverId: 'user-003',
        listingId: 'listing-002',
        listingTitle: 'Calc II Tutoring',
        message: 'Let me know if you want to go over the practice exam before Monday.',
        isRead: true,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date().toISOString(),
    },

    // ── Conversation with Riley Chen (Listing: Food Delivery) ──────────
    {
        id: 'msg-003',
        senderId: 'user-005',
        senderName: 'Riley Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        receiverId: 'mock-user-001',
        listingId: 'listing-004',
        listingTitle: 'Campus Food Delivery',
        listingThumbnail: 'https://images.unsplash.com/photo-1526367790999-015078648402?w=200&auto=format&fit=crop',
        message: 'Your order has been picked up. On my way now!',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'msg-003-reply-1',
        senderId: 'mock-user-001',
        senderName: 'Me',
        receiverId: 'user-005',
        listingId: 'listing-004',
        listingTitle: 'Campus Food Delivery',
        message: 'Awesome, thanks Riley! I will be outside the library in 5 minutes.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 23.5).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const MOCK_TALENT: User[] = [
    { ...MOCK_USER, id: 'talent-001', fullName: 'Ama Mensah', department: 'Graphic Design', skillTags: ['Illustration', 'Branding', 'Figma'] },
    { ...MOCK_USER, id: 'talent-002', fullName: 'Kwame Asante', department: 'Engineering', skillTags: ['Python', 'Machine Learning', 'Data Science'] },
    { ...MOCK_USER, id: 'talent-003', fullName: 'Nana Yaa', department: 'Business', skillTags: ['Marketing', 'Social Media', 'Copywriting'] },
];

/** Synthetic campus users backing listing `ownerId`s (public profiles + chat headers). */
const MOCK_PEER_USERS: Record<string, User> = {
    'user-002': { ...MOCK_USER, id: 'user-002', fullName: 'Alex Rivera', email: 'arivera@university.edu', universityId: '2024002', department: 'Graphic Design', graduationYear: 2026, skillTags: ['Logo Design', 'Branding', 'Figma'], bio: 'Design lead for campus clubs and startups.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
    'user-003': { ...MOCK_USER, id: 'user-003', fullName: 'Jordan Kim', email: 'jkim@university.edu', universityId: '2024003', department: 'Physics', graduationYear: 2025, skillTags: ['STEM Tutoring', 'Calculus'], bio: 'Peer tutor for math and physics courses.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    'user-004': { ...MOCK_USER, id: 'user-004', fullName: 'Sam Okoro', email: 'sokoro@university.edu', universityId: '2024004', department: 'Computer Science', graduationYear: 2026, skillTags: ['React Native', 'Expo', 'TypeScript'], bio: 'Mobile and full-stack projects for student orgs.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop' },
    'user-005': { ...MOCK_USER, id: 'user-005', fullName: 'Riley Chen', email: 'rchen@university.edu', universityId: '2024005', department: 'Business', graduationYear: 2027, skillTags: ['Delivery', 'Logistics'], bio: 'Fast campus delivery and errands.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
    'user-006': { ...MOCK_USER, id: 'user-006', fullName: 'Morgan Blake', email: 'mblake@university.edu', universityId: '2024006', department: 'Film', graduationYear: 2025, skillTags: ['Photography', 'Video'], bio: 'Events, portraits, and short-form content.', canOfferServices: true, profilePictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop' },
    'user-007': { ...MOCK_USER, id: 'user-007', fullName: 'Casey Lee', email: 'clee@university.edu', universityId: '2024007', department: 'English', graduationYear: 2026, skillTags: ['Writing', 'Career'], bio: 'Resume reviews and writing help.', canOfferServices: true },
    'user-008': { ...MOCK_USER, id: 'user-008', fullName: 'Taylor Brooks', email: 'tbrooks@university.edu', universityId: '2024008', department: 'Marketing', graduationYear: 2027, skillTags: ['Social Media', 'Growth'], bio: 'Campus campaigns and brand strategy.', canOfferServices: true },
    'user-009': { ...MOCK_USER, id: 'user-009', fullName: 'Jamie Fox', email: 'jfox@university.edu', universityId: '2024009', department: 'Music', graduationYear: 2025, skillTags: ['Production', 'Mixing'], bio: 'Beats and studio sessions.', canOfferServices: true },
    'user-010': { ...MOCK_USER, id: 'user-010', fullName: 'Riley Nguyen', email: 'rnguyen@university.edu', universityId: '2024010', department: 'Hospitality', graduationYear: 2026, skillTags: ['Events', 'Planning'], bio: 'Student org events and logistics.', canOfferServices: true },
    'user-011': { ...MOCK_USER, id: 'user-011', fullName: 'Quinn Patel', email: 'qpatel@university.edu', universityId: '2024011', department: 'Linguistics', graduationYear: 2027, skillTags: ['Translation', 'Editing'], bio: 'Multilingual editing and translation.', canOfferServices: true },
};

let extraListings: Listing[] = [];

const conversationLifecycle: Record<string, ConversationLifecycle> = {};

const submittedReviews: Review[] = [];

function convKey(me: string, peer: string, listingId?: string): string {
    const [a, b] = [me, peer].sort();
    return `${a}|${b}|${listingId ?? ''}`;
}

function allListingsMerged(): Listing[] {
    return [...MOCK_LISTINGS, ...extraListings];
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

    getProvidersBySubcategory: async (subcategory: string, signal?: AbortSignal): Promise<User[]> => {
        await delay(350, signal);
        // Map of subcategories to popular talent in those fields
        const talentPool = Object.values(MOCK_PEER_USERS).filter(u => u.canOfferServices);
        
        // Return talent that matches the subcategory or has relevant tags
        // In this mock, we just return a slice of providers for any subcategory requested
        return talentPool.filter(u => 
            u.department?.toLowerCase().includes(subcategory.toLowerCase()) || 
            u.skillTags?.some(t => t.toLowerCase().includes(subcategory.toLowerCase())) ||
            talentPool.indexOf(u) % 2 === 0 // Fallback mix
        ).slice(0, 10);
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
        if (_filters?.department) {
            rows = rows.filter((l) => l.department === _filters.department);
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
            const peerId = m.senderId === myId ? m.receiverId : m.senderId;
            const key = `${peerId}-${m.listingId || 'no-listing'}`;
            
            // Note: In a real app we'd also pull the peer's info (name/avatar) 
            // if we are the sender. For this mock, we'll just ensure if sender is 'Me',
            // we attach the correct peer metadata for the UI.
            const messageWithPeer: ChatMessage = {
                ...m,
                // Ensure senderName/Avatar always represent the OTHER person for the Inbox Row UI
                senderName: m.senderId === myId ? (MOCK_PEER_USERS[peerId]?.fullName || 'Me') : m.senderName,
                senderAvatar: m.senderId === myId ? MOCK_PEER_USERS[peerId]?.profilePictureUrl : m.senderAvatar,
                // Custom prop for UI navigation
                peerId: peerId 
            } as any;

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
        return [];
    },

    getApiUrl,
};
