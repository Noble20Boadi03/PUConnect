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
    emoji: string;   // Emoji for visual flair
}

export const CATEGORIES: Category[] = [
    { label: 'All', value: 'all', icon: 'apps-outline', emoji: '🌐' },
    { label: 'Programming', value: 'programming', icon: 'code-slash-outline', emoji: '💻' },
    { label: 'Design', value: 'design', icon: 'color-palette-outline', emoji: '🎨' },
    { label: 'Writing', value: 'writing', icon: 'document-text-outline', emoji: '✍️' },
    { label: 'Tutoring', value: 'tutoring', icon: 'school-outline', emoji: '📚' },
    { label: 'Marketing', value: 'marketing', icon: 'megaphone-outline', emoji: '📢' },
    { label: 'Video & Media', value: 'media', icon: 'videocam-outline', emoji: '🎬' },
    { label: 'Music & Audio', value: 'audio', icon: 'musical-notes-outline', emoji: '🎵' },
    { label: 'Data & AI', value: 'data_ai', icon: 'analytics-outline', emoji: '🤖' },
    { label: 'Business', value: 'business', icon: 'briefcase-outline', emoji: '📊' },
    { label: 'Engineering', value: 'engineering', icon: 'construct-outline', emoji: '⚙️' },
    { label: 'Tech Support', value: 'tech_support', icon: 'hardware-chip-outline', emoji: '🔧' },
    { label: 'Event Services', value: 'events', icon: 'calendar-outline', emoji: '🎉' },
    { label: 'Translation', value: 'translation', icon: 'language-outline', emoji: '🌍' },
    { label: 'Research', value: 'research', icon: 'library-outline', emoji: '🔬' },
];

/** For create.tsx - excludes 'All' filter */
export const LISTING_CATEGORIES = CATEGORIES.filter(c => c.value !== 'all');
