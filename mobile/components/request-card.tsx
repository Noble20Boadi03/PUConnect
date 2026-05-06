import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Listing } from '@/types';
import { Spacing, BorderRadius } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { useTheme } from '@/context/theme-context';

interface RequestCardProps {
    listing: Listing;
    width?: number;
    onPress: () => void;
}

export function RequestCard({ listing, width, onPress }: RequestCardProps) {
    const { theme } = useTheme();

    // Use tags which now contain the official subcategory titles
    const tags = listing.tags || [];

    return (
        <ThemedView
            elevation={1}
            colorName="surface"
            style={[styles.container, width ? { width } : undefined, { borderColor: theme.outlineVariant }]}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.pressable,
                    { opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={onPress}
            >
                <View style={styles.header}>
                    <ThemedText variant="labelSmall" colorName="textMuted" style={styles.timeText}>
                        Posted recently
                    </ThemedText>
                </View>

                <ThemedText variant="titleMedium" style={styles.title} numberOfLines={2}>
                    {listing.title}
                </ThemedText>

                <ThemedText variant="bodyMedium" colorName="textSecondary" style={styles.description} numberOfLines={3}>
                    {listing.description}
                </ThemedText>

                <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: theme.surfaceVariant }]}>
                            <ThemedText variant="labelSmall" colorName="textSecondary">
                                {tag}
                            </ThemedText>
                        </View>
                    ))}
                </View>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    pressable: {
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    timeText: {
        fontSize: 11,
    },
    title: {
        fontWeight: '900',
        fontSize: 18,
        lineHeight: 24,
        marginBottom: Spacing.sm,
    },
    description: {
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    tag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
});
