import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Listing } from '@/types';
import { Spacing, BorderRadius } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ThemedIcon } from './ui/themed-icon';

interface ServiceCardProps {
    listing: Listing;
    onPress: () => void;
    width?: number;
}

export function ServiceCard({ listing, onPress, width = 160 }: ServiceCardProps) {


    // Placeholder image if listing has no image
    const imageUrl = listing.media_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop';

    return (
        <ThemedView
            elevation={1}
            colorName="surface"
            style={[styles.container, { width }]}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.pressable,
                    { opacity: pressed ? 0.95 : 1 },
                ]}
                onPress={onPress}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />
                <View style={styles.content}>
                    <ThemedText variant="titleSmall" numberOfLines={2} style={styles.title}>
                        {listing.title}
                    </ThemedText>
                    <View style={styles.footer}>
                        <ThemedText variant="bodySmall" colorName="textSecondary">From </ThemedText>
                        <ThemedText variant="titleSmall">
                            ${listing.price || listing.budget || '25'}
                        </ThemedText>
                    </View>
                    <View style={styles.ratingRow}>
                        <ThemedIcon name="star" size={12} lightColor="#fbbf24" darkColor="#fbbf24" />
                        <ThemedText variant="labelSmall" colorName="textSecondary">
                            4.9 (124)
                        </ThemedText>
                    </View>
                </View>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        marginRight: Spacing.md,
        overflow: 'hidden',
    },
    pressable: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 120,
    },
    content: {
        padding: Spacing.sm,
    },
    title: {
        fontWeight: '600',
        height: 40,
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 2,
    },
});
