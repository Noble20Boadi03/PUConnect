import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Listing } from '@/types';
import { Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ThemedIcon } from './ui/themed-icon';

interface ListingCardProps {
    listing: Listing;
    width?: number;
    onPress: () => void;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop";

export function ListingCard({ listing, width, onPress }: ListingCardProps) {

    const getBadgeColors = () => {
        switch (listing.type) {
            case 'service_offer':
                return { colorName: 'primary' as const, bgName: 'primaryContainer' as const, label: 'Offer' };
            case 'service_request':
                return { colorName: 'tertiary' as const, bgName: 'tertiaryContainer' as const, label: 'Need' };
            case 'project_team':
                return { colorName: 'secondary' as const, bgName: 'secondaryContainer' as const, label: 'Team' };
            default:
                return { colorName: 'textSecondary' as const, bgName: 'surfaceVariant' as const, label: 'Other' };
        }
    };

    const badge = getBadgeColors();

    return (
        <ThemedView
            elevation={2}
            colorName="surface"
            style={[styles.container, width ? { width } : undefined]}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.pressable,
                    { opacity: pressed ? 0.95 : 1 },
                ]}
                onPress={onPress}
            >
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: listing.media_url || PLACEHOLDER_IMAGE }} 
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <ThemedView colorName={badge.bgName} style={styles.badge}>
                        <ThemedText variant="labelSmall" colorName={badge.colorName} style={styles.badgeText}>
                            {badge.label}
                        </ThemedText>
                    </ThemedView>
                </View>

                <View style={styles.content}>
                    <ThemedText variant="titleMedium" numberOfLines={2} style={styles.title}>
                        {listing.title}
                    </ThemedText>

                    <View style={styles.footer}>
                        <View style={styles.ratingRow}>
                            <ThemedIcon name="star" size={14} lightColor="#fbbf24" darkColor="#fbbf24" />
                            <ThemedText variant="labelLarge" style={styles.ratingText}>
                                {listing.average_rating || '5.0'}
                            </ThemedText>
                            <ThemedText variant="labelMedium" colorName="textMuted">
                                ({listing.review_count || 12})
                            </ThemedText>
                        </View>

                        <View style={styles.priceRow}>
                            <ThemedText variant="labelSmall" colorName="textMuted">FROM</ThemedText>
                            <ThemedText variant="titleMedium" colorName="text" style={styles.priceText}>
                                ${listing.price || listing.budget || 25}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    pressable: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1.5,
        backgroundColor: '#f1f5f9',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
        elevation: 2,
    },
    badgeText: {
        fontWeight: '800',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    content: {
        padding: Spacing.md,
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: '600',
        fontSize: 15,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontWeight: '800',
        fontSize: 14,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceText: {
        fontWeight: '900',
        fontSize: 18,
    },
});
