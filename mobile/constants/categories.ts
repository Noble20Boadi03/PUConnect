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
                    { title: 'Study Group Facilitation', description: "Organized learning for complex topics" }
                ]
            },
            {
                header: 'LANGUAGE & COMM',
                items: [
                    { title: 'Translation', description: "Document and subtitle services" }
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
                header: 'DEVELOPMENT & CODE',
                items: [
                    { title: 'Website & App Development', description: "Build portals for startups, ministries, or clubs" },
                    { title: 'Software Engineering Support', description: "Coding help and academic engineering projects" }
                ]
            },
            {
                header: 'IT & CREATIVE DESIGN',
                items: [
                    { title: 'IT Support & Troubleshooting', description: "Help with campus devices and system portals" }
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
                    { title: 'Event Photography/Video', description: "SRC celebrations, forums, and graduations" },
                    { title: 'Video Editing & Content', description: "Ministry outreach and club social media" }
                ]
            },
            {
                header: 'MUSIC & ARTS',
                items: [
                    { title: 'Graphic Design', description: "Album covers and tailored creative assets" }
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
                    { title: 'Career/Internship Support', description: "Practice for internships with experienced peers" },
                    { title: 'LinkedIn Optimization', description: "Professionalize your online profile" }
                ]
            },
            {
                header: 'BUSINESS TOOLS',
                items: []
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
                    { title: 'Equipment Rental', description: "Find cameras, mics, or tools to borrow" }
                ]
            },
            {
                header: 'EVENT HELP',
                items: [
                    { title: 'Beauty & Personal Care', description: "Hair, makeup, and styling services" }
                ]
            }
        ]
    }
];
