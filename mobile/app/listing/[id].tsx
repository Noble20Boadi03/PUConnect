import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Listing, User } from '@/types';
import { useAuth } from '@/context/auth-context';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ListingDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [listing, setListing] = useState<Listing | null>(null);
    const [owner, setOwner] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const { token, user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const listingData = await api.getListing(id);
            setListing(listingData);

            // Fetch owner profile if we can, this assumes an endpoint like users/{id} exists, 
            // but for now we might not have a public user endpoint, so we might skip it or use a mock
            // In a complete app we would do:
            // const ownerData = await api.getUser(listingData.ownerId);
            // setOwner(ownerData);

        } catch (error) {
            console.error('Error fetching listing details:', error);
            Alert.alert('Error', 'Could not load the listing.');
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = () => {
        if (!token || !user) {
            Alert.alert('Authentication Required', 'Please log in to contact this student.');
            return;
        }

        if (listing?.ownerId === user.id) {
            Alert.alert('Notice', "You can't message yourself!");
            return;
        }

        // Ideally navigate to a chat screen, passing the ownerId and listingId
        // something like router.push(`/chat/${listing?.ownerId}?listingId=${listing?.id}`);
        // But since we just have a general messages screen for now:
        Alert.alert('Coming Soon', 'Chat interface is being wired up.');
    };

    if (loading) {
        return (
            <ThemedView style={[styles.centered, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ title: 'Loading...' }} />
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    if (!listing) {
        return (
            <ThemedView style={[styles.centered, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ title: 'Not Found' }} />
                <Ionicons name="alert-circle-outline" size={48} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, marginTop: 10 }}>Listing not found.</Text>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Details',
                    headerBackTitleVisible: false,
                    headerTintColor: theme.text,
                    headerStyle: { backgroundColor: theme.background }
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.typeBadge}>
                        <Text style={[styles.typeBadgeText, { color: theme.primary }]}>
                            {listing.type === 'service_offer' ? 'OFFER' : listing.type === 'service_request' ? 'REQUEST' : 'TEAM'}
                        </Text>
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>{listing.title}</Text>
                    <Text style={[styles.priceInfo, { color: theme.primary }]}>
                        {listing.price ? `$${listing.price}` : listing.budget ? `Budget: $${listing.budget}` : 'Project'}
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {listing.description || 'No description provided.'}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="folder-outline" size={16} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>{listing.category}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>
                                {new Date(listing.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {listing.requiredSkills && listing.requiredSkills.length > 0 && (
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Required Skills</Text>
                        <View style={styles.skillsContainer}>
                            {listing.requiredSkills.map((skill, idx) => (
                                <View key={idx} style={[styles.skillTag, { borderColor: theme.border, backgroundColor: theme.background }]}>
                                    <Text style={[styles.skillText, { color: theme.text }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Posted By</Text>
                    <View style={styles.ownerRow}>
                        <View style={[styles.avatar, { backgroundColor: theme.background }]}>
                            <Ionicons name="person" size={24} color={theme.textMuted} />
                        </View>
                        <View style={styles.ownerInfo}>
                            <Text style={[styles.ownerName, { color: theme.text }]}>
                                Student {listing.ownerId.slice(0, 4)}
                            </Text>
                            <Text style={[styles.ownerSubtitle, { color: theme.textMuted }]}>
                                View Profile
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <Pressable
                    style={[styles.messageButton, { backgroundColor: theme.primary }]}
                    onPress={handleMessage}
                >
                    <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                    <Text style={styles.messageButtonText}>Message Student</Text>
                </Pressable>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        backgroundColor: '#e0e7ff',
        marginBottom: Spacing.sm,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: Spacing.xs,
        lineHeight: 32,
    },
    priceInfo: {
        fontSize: 20,
        fontWeight: '700',
    },
    card: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
        ...Shadows.small,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    skillText: {
        fontSize: 13,
        fontWeight: '500',
    },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ownerInfo: {
        marginLeft: Spacing.md,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: '700',
    },
    ownerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        paddingBottom: 30, // account for safe area
        borderTopWidth: 1,
    },
    messageButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 54,
        borderRadius: BorderRadius.lg,
        gap: 8,
        ...Shadows.medium,
    },
    messageButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
