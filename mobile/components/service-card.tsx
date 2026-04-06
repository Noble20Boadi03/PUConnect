import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Listing } from '@/types';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface ServiceCardProps {
    listing: Listing;
    onPress: () => void;
    width?: number;
}

export function ServiceCard({ listing, onPress, width = 160 }: ServiceCardProps) {
    const { theme } = useTheme();

    // Placeholder image if listing has no image
    const imageUrl = listing.media_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop';

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                { backgroundColor: theme.surface, width, opacity: pressed ? 0.95 : 1 },
                Shadows.small
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
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                    {listing.title}
                </Text>
                <View style={styles.footer}>
                    <Text style={[styles.priceTag, { color: theme.textSecondary }]}>From </Text>
                    <Text style={[styles.price, { color: theme.text }]}>
                        ${listing.price || listing.budget || '25'}
                    </Text>
                </View>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                        4.9 (124)
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        marginRight: Spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    image: {
        width: '100%',
        height: 120,
    },
    content: {
        padding: Spacing.sm,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
        height: 36,
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceTag: {
        fontSize: 11,
    },
    price: {
        fontSize: 14,
        fontWeight: '800',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 2,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '500',
    },
});
