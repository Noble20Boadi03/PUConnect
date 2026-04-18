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
    image: string; // Unsplash URL or local image
    icon: string; // MaterialCommunityIcons name for fallback/detail page
    groups: SubCategoryGroup[];
}

export const CAMPUS_CATEGORIES: DetailedCategory[] = [
    {
        id: 'academics',
        title: 'Academics & Language',
        subtitle: 'Tutoring, Exam Prep, Translation',
        tagline: '"Master your courses with peer support"',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
        icon: 'book-open-page-variant-outline',
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
                header: 'LANGUAGE & COMM',
                items: [
                    { title: 'Translation', description: "Document and subtitle services" },
                    { title: 'Speech Writing', description: "Professional scripts for your next presentation" },
                    { title: 'Proofreading', description: "Ensure your essays are mistake-free" }
                ]
            }
        ]
    },
    {
        id: 'tech_design',
        title: 'Tech & Creative',
        subtitle: 'Web, Apps, Graphic Design',
        tagline: '"Build and design the future"',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
        icon: 'code-json',
        groups: [
            {
                header: 'DEVELOPMENT',
                items: [
                    { title: 'Portfolio Websites', description: "Professional online presence for your career" },
                    { title: 'App Design', description: "Modern UI/UX for your mobile concepts" },
                    { title: 'Automation Scripts', description: "Scripts to handle repetitive tasks easily" }
                ]
            },
            {
                header: 'CREATIVE DESIGN',
                items: [
                    { title: 'Poster & Flyer Design', description: "Eye-catching designs for campus events" },
                    { title: 'Logo & Branding', description: "Complete visual identity for your club or startup" },
                    { title: 'Digital Illustration', description: "Custom graphics and artwork" }
                ]
            }
        ]
    },
    {
        id: 'media_music',
        title: 'Media & Music',
        subtitle: 'Photo, Video, Arts, Audio',
        tagline: '"Capture and create campus culture"',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
        icon: 'camera-iris',
        groups: [
            {
                header: 'PHOTO & VIDEO',
                items: [
                    { title: 'Event Coverage', description: "High-quality campus event photography" },
                    { title: 'Graduation Portraits', description: "Professional shots for your big milestone" },
                    { title: 'Video Recaps', description: "Dynamic video content for clubs and festivals" }
                ]
            },
            {
                header: 'MUSIC & AUDIO',
                items: [
                    { title: 'Audio Mixing', description: "Master your tracks or podcast episodes" },
                    { title: 'Podcast Production', description: "Complete setup and editing aid" },
                    { title: 'Live Performance', description: "DJs and musicians for campus parties" }
                ]
            }
        ]
    },
    {
        id: 'biz_career',
        title: 'Business & Career',
        subtitle: 'CVs, Startups, Job Prep',
        tagline: '"Launch your career on campus"',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
        icon: 'briefcase-check-outline',
        groups: [
            {
                header: 'CAREER READINESS',
                items: [
                    { title: 'CV & Cover Letters', description: "Stand out to recruiters with polished docs" },
                    { title: 'Mock Interviews', description: "Practice for internships with experienced peers" },
                    { title: 'LinkedIn Optimization', description: "Professionalize your online profile" }
                ]
            },
            {
                header: 'BUSINESS TOOLS',
                items: [
                    { title: 'Market Research', description: "Data-driven insights for your student startup" },
                    { title: 'Pitch Deck Aid', description: "Design and strategy for your business pitch" },
                    { title: 'Club Finances', description: "Managing budget and sponsorship outreach" }
                ]
            }
        ]
    },
    {
        id: 'campus_life',
        title: 'Campus & Lifestyle',
        subtitle: 'Logistics, Delivery, Daily Help',
        tagline: '"Everyday help, right where you are"',
        image: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=800',
        icon: 'store-outline',
        groups: [
            {
                header: 'LOGISTICS',
                items: [
                    { title: 'Campus Delivery', description: "Quick delivery across campus buildings" },
                    { title: 'Printing & Binding', description: "Last-minute project prints delivered" },
                    { title: 'Equipment Rental', description: "Find cameras, mics, or tools to borrow" }
                ]
            },
            {
                header: 'EVENT HELP',
                items: [
                    { title: 'Event Set-up', description: "Extra hands for club event logistics" },
                    { title: 'Decoration', description: "Creative set-up for your next campus party" },
                    { title: 'Catering Support', description: "Helping manage food and drinks for crowds" }
                ]
            }
        ]
    }
];
