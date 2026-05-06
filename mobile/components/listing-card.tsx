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
                </View>

                <View style={styles.content}>
                    <View style={styles.userRow}>
                        {listing.ownerAvatar ? (
                            <Image source={{ uri: listing.ownerAvatar }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarImage, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                                <ThemedIcon name="account" size={16} colorName="textSecondary" />
                            </View>
                        )}
                        <ThemedText variant="labelLarge" style={styles.userName}>
                            {listing.ownerName || "Student Provider"}
                        </ThemedText>
                    </View>

                    <ThemedText variant="bodyMedium" numberOfLines={2} style={styles.title}>
                        {listing.title}
                    </ThemedText>

                    <View style={styles.footer}>
                        <View style={{ flex: 1 }} />
                        <ThemedText variant="labelMedium" colorName="textSecondary" style={styles.priceLabel}>
                            <ThemedText style={styles.priceValue}>${listing.price || listing.budget || 15}</ThemedText>
                        </ThemedText>
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
        aspectRatio: 1.2,
        backgroundColor: '#f1f5f9',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: Spacing.md,
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: '400',
        marginBottom: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    avatarImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: Spacing.sm,
    },
    userName: {
        fontWeight: '600',
    },
    priceLabel: {
        fontSize: 12,
    },
    priceValue: {
        fontWeight: '800',
        fontSize: 16,
    },
});
