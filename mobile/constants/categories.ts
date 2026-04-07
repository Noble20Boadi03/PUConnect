export interface SubCategory {
    title: string;
    description?: string;
    isNew?: boolean;
}

export interface SubCategoryGroup {
    header: string;
    items: SubCategory[];
}

export interface DetailedCategory {
    id: string;
    title: string;
    subtitle: string;
    tagline: string;
    icon: string; // Ionicons name
    groups: SubCategoryGroup[];
}

export const CAMPUS_CATEGORIES: DetailedCategory[] = [
    {
        id: 'tutoring',
        title: 'Tutoring & Peer Learning',
        subtitle: 'Subject Tutoring, Exam Preparation',
        tagline: '"Learn from those who\'ve been there"',
        icon: 'book-outline',
        groups: [
            {
                header: 'ACADEMIC SUPPORT',
                items: [
                    { title: 'Subject Tutoring', description: "Find a peer who's already aced the course" },
                    { title: 'Exam Preparation', description: "Drill key concepts before the big day" },
                    { title: 'Study Group Facilitation', description: "Organized learning for complex topics" }
                ]
            },
            {
                header: 'SKILL BUILDING',
                items: [
                    { title: 'Language Practice', description: "Conversational fluency with native speakers" },
                    { title: 'Coding Bootcamp', description: "Master the stack for your next internship" },
                    { title: 'Math & Sciences', description: "Expert help in STEM fundamentals" }
                ]
            }
        ]
    },
    {
        id: 'tech',
        title: 'Tech & Development',
        subtitle: 'Portfolio Websites, Campus Tools',
        tagline: '"Build something that matters"',
        icon: 'code-slash-outline',
        groups: [
            {
                header: 'PERSONAL PROJECTS',
                items: [
                    { title: 'Portfolio Websites', description: "Get a professional online presence for your career" },
                    { title: 'Campus Tools', description: "Software solutions for daily campus life" },
                    { title: 'Automation Scripts', description: "Scripts to handle repetitive tasks easily" }
                ]
            },
            {
                header: 'MOBILE & WEB',
                items: [
                    { title: 'App Design', description: "Modern UI/UX for your mobile concepts" },
                    { title: 'Web Development', description: "Custom sites from landing pages to full-apps" },
                    { title: 'Database Setup', description: "Secure and optimized data management" }
                ]
            }
        ]
    },
    {
        id: 'design',
        title: 'Creative Design',
        subtitle: 'Event Posters, Club Flyers',
        tagline: '"Make your ideas look as good as they are"',
        icon: 'color-palette-outline',
        groups: [
            {
                header: 'EVENT & CAMPUS',
                items: [
                    { title: 'Event Posters', description: "Eye-catching designs for campus clubs and events" },
                    { title: 'Club Flyers', description: "Hand out flyers that folks actually keep" },
                    { title: 'Banners', description: "Large-scale branding for campus festivals", isNew: true }
                ]
            },
            {
                header: 'PERSONAL BRANDING',
                items: [
                    { title: 'Logo Design' },
                    { title: 'Business Cards' },
                    { title: 'Brand Identity' }
                ]
            }
        ]
    },
    {
        id: 'career',
        title: 'Career Development',
        subtitle: 'CV Writing, Cover Letters',
        tagline: '"Your career starts on campus"',
        icon: 'briefcase-outline',
        groups: [
            {
                header: 'JOB READINESS',
                items: [
                    { title: 'CV Writing' },
                    { title: 'Cover Letters' },
                    { title: 'LinkedIn Optimization' }
                ]
            },
            {
                header: 'INTERVIEW PREP',
                items: [
                    { title: 'Mock Interviews' },
                    { title: 'Career Coaching' },
                    { title: 'Portfolio Review' }
                ]
            }
        ]
    },
    {
        id: 'photo',
        title: 'Photography & Media',
        subtitle: 'Campus Events, Graduation Portraits',
        tagline: '"Capture every campus moment"',
        icon: 'camera-outline',
        groups: [
            {
                header: 'EVENTS',
                items: [
                    { title: 'Campus Event Coverage' },
                    { title: 'Club Photography' },
                    { title: 'Graduation Portraits' }
                ]
            },
            {
                header: 'CONTENT',
                items: [
                    { title: 'Product Shots' },
                    { title: 'Lifestyle Photography' },
                    { title: 'Headshots' }
                ]
            }
        ]
    },
    {
        id: 'video',
        title: 'Video & Content Creation',
        subtitle: 'Club Highlights, Event Recaps',
        tagline: '"Tell your story, your way"',
        icon: 'videocam-outline',
        groups: [
            {
                header: 'PERSONAL PROJECTS',
                items: [
                    { title: 'YouTube Videos' },
                    { title: 'Short Films' },
                    { title: 'Documentaries' }
                ]
            },
            {
                header: 'CAMPUS CONTENT',
                items: [
                    { title: 'Club Highlight Videos' },
                    { title: 'Event Recaps' },
                    { title: 'Intro & Outro' }
                ]
            }
        ]
    },
    {
        id: 'music',
        title: 'Music & Performing Arts',
        subtitle: 'Audio Mixing, Voiceover',
        tagline: '"Campus has talent — let it show"',
        icon: 'musical-notes-outline',
        groups: [
            {
                header: 'AUDIO',
                items: [
                    { title: 'Music Composition' },
                    { title: 'Podcast Production' },
                    { title: 'Voiceover' }
                ]
            },
            {
                header: 'LIVE',
                items: [
                    { title: 'Event Performance' },
                    { title: 'DJ Services' },
                    { title: 'Session Musicians' }
                ]
            }
        ]
    },
    {
        id: 'language',
        title: 'Language & Communication',
        subtitle: 'Translation, Proofreading',
        tagline: '"Break barriers, connect better"',
        icon: 'text-outline',
        groups: [
            {
                header: 'TRANSLATION',
                items: [
                    { title: 'Document Translation' },
                    { title: 'Subtitles' },
                    { title: 'Transcription' }
                ]
            },
            {
                header: 'COMMUNICATION',
                items: [
                    { title: 'Speech Writing' },
                    { title: 'Presentation Coaching' },
                    { title: 'Proofreading' }
                ]
            }
        ]
    },
    {
        id: 'biz',
        title: 'Business & Entrepreneurship',
        subtitle: 'Startups, Market Research',
        tagline: '"From student to founder"',
        icon: 'trending-up-outline',
        groups: [
            {
                header: 'STARTUPS',
                items: [
                    { title: 'Business Plan' },
                    { title: 'Market Research' },
                    { title: 'Branding' }
                ]
            },
            {
                header: 'CAMPUS BUSINESS',
                items: [
                    { title: 'Club Finances' },
                    { title: 'Event Budgeting' },
                    { title: 'Sponsorship Outreach' }
                ]
            }
        ]
    },
    {
        id: 'campus',
        title: 'Campus Services',
        subtitle: 'Logistics, Delivery',
        tagline: '"Everyday help, right on campus"',
        icon: 'storefront-outline',
        groups: [
            {
                header: 'LOGISTICS',
                items: [
                    { title: 'Printing & Binding' },
                    { title: 'Campus Delivery' },
                    { title: 'Equipment Rental' }
                ]
            },
            {
                header: 'EVENTS',
                items: [
                    { title: 'Event Setup' },
                    { title: 'Decoration' },
                    { title: 'Photography Booth' }
                ]
            }
        ]
    }
];
