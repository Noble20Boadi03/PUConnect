import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Listing } from '@/types';
import { Spacing, BorderRadius } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ThemedIcon } from './ui/themed-icon';

interface ListingCardProps {
    listing: Listing;
    onPress: () => void;
}

export function ListingCard({ listing, onPress }: ListingCardProps) {


    const getBadgeColors = () => {
        switch (listing.type) {
            case 'service_offer':
                return { colorName: 'primary' as const, bgName: 'primaryContainer' as const, label: 'Offer' };
            case 'service_request':
                return { colorName: 'tertiary' as const, bgName: 'tertiaryContainer' as const, label: 'Request' };
            case 'project_team':
                return { colorName: 'secondary' as const, bgName: 'secondaryContainer' as const, label: 'Team' };
            default:
                return { colorName: 'textSecondary' as const, bgName: 'surfaceVariant' as const, label: 'Other' };
        }
    };

    const badge = getBadgeColors();

    return (
        <ThemedView
            elevation={1}
            colorName="surface"
            style={styles.container}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.pressable,
                    { opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={onPress}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <ThemedView colorName={badge.bgName} style={styles.badge}>
                            <ThemedText variant="labelSmall" colorName={badge.colorName} style={styles.badgeText}>
                                {badge.label}
                            </ThemedText>
                        </ThemedView>
                        {listing.price ? (
                            <ThemedText variant="titleMedium" colorName="primary">
                                ${listing.price}
                            </ThemedText>
                        ) : listing.budget ? (
                            <ThemedText variant="titleMedium" colorName="secondary">
                                Budget: ${listing.budget}
                            </ThemedText>
                        ) : (
                            <ThemedText variant="titleMedium" colorName="tertiary">
                                Project
                            </ThemedText>
                        )}
                    </View>

                    <ThemedText variant="titleMedium" numberOfLines={2} style={styles.title}>
                        {listing.title}
                    </ThemedText>

                    <ThemedText variant="bodyMedium" colorName="textSecondary" numberOfLines={2} style={styles.description}>
                        {listing.description}
                    </ThemedText>

                    <View style={styles.footer}>
                        <View style={styles.metaInfo}>
                            <ThemedIcon name="school-outline" size={14} colorName="textMuted" />
                            <ThemedText variant="labelMedium" colorName="textMuted" style={styles.metaText}>
                                {listing.category}
                            </ThemedText>
                        </View>

                        {listing.requiredSkills && listing.requiredSkills.length > 0 && (
                            <View style={styles.skillsContainer}>
                                {listing.requiredSkills.slice(0, 2).map((skill, idx) => (
                                    <ThemedView key={idx} colorName="surfaceVariant" style={styles.skillTag}>
                                        <ThemedText variant="labelSmall" colorName="onSurfaceVariant">
                                            {skill}
                                        </ThemedText>
                                    </ThemedView>
                                ))}
                                {listing.requiredSkills.length > 2 && (
                                    <ThemedText variant="labelSmall" colorName="textMuted" style={styles.moreText}>
                                        +{listing.requiredSkills.length - 2}
                                    </ThemedText>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    pressable: {
        flex: 1,
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
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    title: {
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    description: {
        marginBottom: Spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.sm,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: 4,
    },
    skillsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skillTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
        marginLeft: 4,
    },
    moreText: {
        marginLeft: 4,
    },
});
