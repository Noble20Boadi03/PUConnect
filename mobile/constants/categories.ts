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
    { label: 'Programming', value: 'programming', icon: 'code-slash-outline' },
    { label: 'Design', value: 'design', icon: 'color-palette-outline' },
    { label: 'Writing', value: 'writing', icon: 'document-text-outline' },
    { label: 'Tutoring', value: 'tutoring', icon: 'school-outline' },
    { label: 'Marketing', value: 'marketing', icon: 'megaphone-outline' },
    { label: 'Video & Media', value: 'media', icon: 'videocam-outline' },
    { label: 'Music & Audio', value: 'audio', icon: 'musical-notes-outline' },
    { label: 'Data & AI', value: 'data_ai', icon: 'analytics-outline' },
    { label: 'Business', value: 'business', icon: 'briefcase-outline' },
    { label: 'Engineering', value: 'engineering', icon: 'construct-outline' },
    { label: 'Tech Support', value: 'tech_support', icon: 'hardware-chip-outline' },
    { label: 'Event Services', value: 'events', icon: 'calendar-outline' },
    { label: 'Translation', value: 'translation', icon: 'language-outline' },
    { label: 'Research', value: 'research', icon: 'library-outline' },
];

/** For create.tsx - excludes 'All' filter */
export const LISTING_CATEGORIES = CATEGORIES.filter(c => c.value !== 'all');
