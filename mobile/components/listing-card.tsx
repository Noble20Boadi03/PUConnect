import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Listing } from '@/types';
import { Spacing, BorderRadius } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ThemedIcon } from './ui/themed-icon';
import { useTheme } from '@/context/theme-context';

import { Image } from 'expo-image';

interface ListingCardProps {
    listing: Listing;
    width?: number;
    onPress: () => void;
}

export function ListingCard({ listing, width, onPress }: ListingCardProps) {
    const { theme } = useTheme();

    return (
        <ThemedView
            elevation={1}
            colorName="surface"
            style={[styles.container, width ? { width } : undefined]}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.pressable,
                    { opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={onPress}
            >
                {/* Featured Image */}
                <View style={[styles.imageContainer, { backgroundColor: theme.surfaceVariant }]}>
                    <Image
                        source={listing.media_url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop'}
                        style={styles.image}
                        contentFit="cover"
                        transition={200}
                    />
                    {/* Optional Badge Overlay */}
                    <ThemedView colorName="primaryContainer" style={styles.badgeOverlay}>
                        <ThemedText variant="labelSmall" colorName="primary" style={styles.badgeText}>
                            {listing.type === 'service_offer' ? 'PRO' : 'NEW'}
                        </ThemedText>
                    </ThemedView>
                </View>

                <View style={styles.content}>
                    {/* Rating Row */}
                    <View style={styles.ratingRow}>
                        <ThemedIcon name="star" size={14} colorName="primary" />
                        <ThemedText variant="labelMedium" style={styles.ratingText}>
                            {listing.average_rating || '5.0'}
                        </ThemedText>
                        <ThemedText variant="labelMedium" colorName="textMuted">
                            ({listing.review_count || '0'})
                        </ThemedText>
                    </View>

                    {/* Title */}
                    <ThemedText variant="titleMedium" numberOfLines={2} style={styles.title}>
                        {listing.title}
                    </ThemedText>

                    {/* Footer: Price and Favorite */}
                    <View style={styles.footer}>
                        <View style={styles.priceContainer}>
                            <ThemedText variant="labelSmall" colorName="textMuted">FROM</ThemedText>
                            <ThemedText variant="titleMedium" style={styles.price}>
                                ${listing.price || listing.budget || '25'}
                            </ThemedText>
                        </View>
                        <ThemedIcon name="heart-outline" size={20} colorName="textMuted" />
                    </View>
                </View>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.md,
        marginRight: Spacing.md,
        marginBottom: Spacing.xs, // Small bottom margin for list spacing
        overflow: 'hidden',
    },
    pressable: {
        flex: 1,
    },
    imageContainer: {
        aspectRatio: 1.5,
        width: '100%',
        position: 'relative',
    },
    image: {
        flex: 1,
    },
    badgeOverlay: {
        position: 'absolute',
        top: Spacing.xs,
        left: Spacing.xs,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    badgeText: {
        fontWeight: '800',
        fontSize: 10,
    },
    content: {
        padding: Spacing.sm,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    ratingText: {
        fontWeight: '700',
        marginLeft: 2,
        marginRight: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        height: 40, // Fixed height for 2 lines to align cards
        marginBottom: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.xs,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontWeight: '800',
        marginLeft: 4,
    },
});
