import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Listing } from '@/types';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

interface ListingCardProps {
    listing: Listing;
    onPress: () => void;
}

export function ListingCard({ listing, onPress }: ListingCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const getBadgeColors = () => {
        switch (listing.type) {
            case 'service_offer':
                return { bg: '#e0e7ff', text: '#4338ca', label: 'Offer' };
            case 'service_request':
                return { bg: '#fef3c7', text: '#92400e', label: 'Request' };
            case 'project_team':
                return { bg: '#d1fae5', text: '#065f46', label: 'Team' };
            default:
                return { bg: theme.border, text: theme.textSecondary, label: 'Other' };
        }
    };

    const badge = getBadgeColors();

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                { backgroundColor: theme.surface, opacity: pressed ? 0.9 : 1 },
                Shadows.medium
            ]}
            onPress={onPress}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                    {listing.price ? (
                        <Text style={[styles.price, { color: theme.primary }]}>${listing.price}</Text>
                    ) : listing.budget ? (
                        <Text style={[styles.price, { color: theme.secondary }]}>Budget: ${listing.budget}</Text>
                    ) : (
                        <Text style={[styles.price, { color: theme.accent }]}>Project</Text>
                    )}
                </View>

                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                    {listing.title}
                </Text>

                <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                    {listing.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.metaInfo}>
                        <Ionicons name="school-outline" size={14} color={theme.textMuted} />
                        <Text style={[styles.metaText, { color: theme.textMuted }]}>{listing.category}</Text>
                    </View>

                    {listing.requiredSkills && listing.requiredSkills.length > 0 && (
                        <View style={styles.skillsContainer}>
                            {listing.requiredSkills.slice(0, 2).map((skill, idx) => (
                                <View key={idx} style={[styles.skillTag, { borderColor: theme.border }]}>
                                    <Text style={[styles.skillText, { color: theme.textSecondary }]}>{skill}</Text>
                                </View>
                            ))}
                            {listing.requiredSkills.length > 2 && (
                                <Text style={[styles.moreText, { color: theme.textMuted }]}>+{listing.requiredSkills.length - 2}</Text>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    content: {
        padding: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.xs,
        lineHeight: 24,
    },
    description: {
        fontSize: 14,
        marginBottom: Spacing.md,
        lineHeight: 20,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: Spacing.sm,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        marginLeft: 4,
    },
    skillsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skillTag: {
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        marginLeft: 4,
    },
    skillText: {
        fontSize: 10,
        fontWeight: '500',
    },
    moreText: {
        fontSize: 10,
        marginLeft: 4,
    },
});
