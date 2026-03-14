/**
 * CATEGORIES - Single Source of Truth
 *
 * All categories for the PuConnect marketplace.
 * Used in: home.tsx (filter), create.tsx (listing creation)
 * Synced with: backend app/models/enums.py CategoryType
 */

export interface Category {
    label: string;   // Display label
    value: string;   // Backend value / filter key
    icon: string;    // Ionicons icon name
}

export const CATEGORIES: Category[] = [
    { label: 'All', value: 'all', icon: 'apps-outline' },
    { label: 'Academic tutoring', value: 'tutoring', icon: 'school-outline' },
    { label: 'Programming / software development', value: 'software_dev', icon: 'code-slash-outline' },
    { label: 'Graphic design', value: 'graphic_design', icon: 'color-palette-outline' },
    { label: 'Website development', value: 'web_dev', icon: 'globe-outline' },
    { label: 'Assignment/project guidance', value: 'assignment_guidance', icon: 'book-outline' },
    { label: 'Social media management', value: 'social_media', icon: 'share-social-outline' },
    { label: 'Video editing', value: 'video_editing', icon: 'videocam-outline' },
    { label: 'Photography', value: 'photography', icon: 'camera-outline' },
    { label: 'Resume/CV design', value: 'resume_design', icon: 'document-text-outline' },
    { label: 'Data analysis / Excel help', value: 'data_analysis', icon: 'bar-chart-outline' },
];

/** For create.tsx - excludes 'All' filter */
export const LISTING_CATEGORIES = CATEGORIES.filter(c => c.value !== 'all');
