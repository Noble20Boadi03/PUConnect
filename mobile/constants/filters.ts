import { SubcategoryFilter } from '../types';

const defaultDate = new Date().toISOString();

export const GLOBAL_FILTERS: SubcategoryFilter[] = [];

export const SUBCATEGORY_FILTERS: Record<string, SubcategoryFilter[]> = {
    'Subject Tutoring': [
        {
            id: 'f-st-1',
            subcategory: 'Subject Tutoring',
            filter_label: 'Subject',
            filter_type: 'multi_select',
            filter_options: ['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'History', 'Economics'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Study Group Facilitation': [
        {
            id: 'f-sg-1',
            subcategory: 'Study Group Facilitation',
            filter_label: 'Subject / Course',
            filter_type: 'multi_select',
            filter_options: ['Math', 'Physics', 'Computer Science', 'Business', 'Engineering'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        },
        {
            id: 'f-sg-2',
            subcategory: 'Study Group Facilitation',
            filter_label: 'Group size',
            filter_type: 'dropdown',
            filter_options: ['2-3 students', '4-5 students', '6+ students'],
            display_order: 2,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Translation': [
        {
            id: 'f-tr-1',
            subcategory: 'Translation',
            filter_label: 'Language Pair',
            filter_type: 'multi_select',
            filter_options: ['French → English', 'English → French', 'Spanish → English', 'English → Spanish', 'Spanish → Twi', 'Twi → English'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        },
        {
            id: 'f-tr-2',
            subcategory: 'Translation',
            filter_label: 'Document type',
            filter_type: 'multi_select',
            filter_options: ['academic', 'casual', 'legal'],
            display_order: 2,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Website & App Development': [
        {
            id: 'f-wd-1',
            subcategory: 'Website & App Development',
            filter_label: 'Service Type',
            filter_type: 'multi_select',
            filter_options: ['Landing page', 'Portfolio', 'E-commerce', 'Mobile app', 'Full-stack Web App'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Software Engineering Support': [
        {
            id: 'f-se-1',
            subcategory: 'Software Engineering Support',
            filter_label: 'Programming Language / Tech',
            filter_type: 'multi_select',
            filter_options: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'SQL', 'Go'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        },
        {
            id: 'f-se-2',
            subcategory: 'Software Engineering Support',
            filter_label: 'Task type',
            filter_type: 'multi_select',
            filter_options: ['debugging', 'code review', 'tutoring', 'architecture design'],
            display_order: 2,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'IT Support & Troubleshooting': [
        {
            id: 'f-it-1',
            subcategory: 'IT Support & Troubleshooting',
            filter_label: 'Issue/Device Type',
            filter_type: 'multi_select',
            filter_options: ['Laptop', 'Network', 'Software install', 'Printer', 'Data Recovery'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        },
        {
            id: 'f-it-2',
            subcategory: 'IT Support & Troubleshooting',
            filter_label: 'OS',
            filter_type: 'multi_select',
            filter_options: ['Windows', 'Mac', 'Linux'],
            display_order: 2,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Event Photography/Video': [
        {
            id: 'f-ep-1',
            subcategory: 'Event Photography/Video',
            filter_label: 'Event Type',
            filter_type: 'multi_select',
            filter_options: ['Birthday', 'Graduation', 'Conference', 'Sports', 'Party/Social'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Video Editing & Content': [
        {
            id: 'f-ve-1',
            subcategory: 'Video Editing & Content',
            filter_label: 'Content Type',
            filter_type: 'multi_select',
            filter_options: ['YouTube', 'Reels/TikTok', 'Documentary', 'Podcast', 'Music Video'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Graphic Design': [
        {
            id: 'f-gd-1',
            subcategory: 'Graphic Design',
            filter_label: 'Design Type',
            filter_type: 'multi_select',
            filter_options: ['Logo', 'Flyer', 'Social media post', 'Branding', 'Poster', 'UI/UX'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'CV & Cover Letters': [
        {
            id: 'f-cv-1',
            subcategory: 'CV & Cover Letters',
            filter_label: 'Service Type',
            filter_type: 'multi_select',
            filter_options: ['CV writing', 'Cover letter', 'Review/edit', 'LinkedIn alignment'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Career / Internship Support': [
        {
            id: 'f-ci-1',
            subcategory: 'Career / Internship Support',
            filter_label: 'Support Type',
            filter_type: 'multi_select',
            filter_options: ['Interview prep', 'Job search strategy', 'Application review', 'Mock Interviews'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'LinkedIn Optimization': [
        {
            id: 'f-lo-1',
            subcategory: 'LinkedIn Optimization',
            filter_label: 'Service Type',
            filter_type: 'multi_select',
            filter_options: ['Profile rewrite', 'Headline only', 'Full audit', 'Networking strategy'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Equipment Rental': [
        {
            id: 'f-er-1',
            subcategory: 'Equipment Rental',
            filter_label: 'Equipment Category',
            filter_type: 'multi_select',
            filter_options: ['Camera', 'Lighting', 'Audio', 'Projector', 'Sports gear'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        },
        {
            id: 'f-er-2',
            subcategory: 'Equipment Rental',
            filter_label: 'Rental duration',
            filter_type: 'dropdown',
            filter_options: ['1 day', '2-3 days', '1 week', '2+ weeks'],
            display_order: 2,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        },
        {
            id: 'f-er-3',
            subcategory: 'Equipment Rental',
            filter_label: 'Availability',
            filter_type: 'dropdown',
            filter_options: ['Available Now', 'Next Week', 'Pre-book'],
            display_order: 3,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ],
    'Beauty & Personal Care': [
        {
            id: 'f-bp-1',
            subcategory: 'Beauty & Personal Care',
            filter_label: 'Service Type',
            filter_type: 'multi_select',
            filter_options: ['Hair', 'Makeup', 'Nails', 'Skincare', 'Braiding', 'Barbering'],
            display_order: 1,
            is_active: true,
            created_at: defaultDate,
            updated_at: defaultDate,
        }
    ]
};
