import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { User } from '@/types';

const SUGGESTED_SKILLS = ['React Native', 'Data Analysis', 'Calculus', 'UI Design', 'Copywriting', 'Video Editing'];

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [talents, setTalents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        const fetchTalent = async () => {
            setIsLoading(true);
            try {
                // Normalize data in case backend returned snake_case locally before auth-context mapping
                const data = await api.getTalent(searchQuery);
                const baseUrl = api.getApiUrl().replace('/api/v1', '');

                const normalizedData = data.map((u: any) => {
                    let picUrl = u.profilePictureUrl ?? u.profile_picture_url;
                    if (picUrl && picUrl.startsWith('/')) {
                        picUrl = `${baseUrl}${picUrl}`;
                    }

                    return {
                        ...u,
                        fullName: u.fullName ?? u.full_name,
                        profilePictureUrl: picUrl,
                        skillTags: u.skillTags ?? u.skill_tags,
                    };
                });
                setTalents(normalizedData);
            } catch (e) {
                console.error('Failed to fetch talent:', e);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchTalent();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery]);

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Find Talent</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Connect with skilled students</Text>
                </View>

                <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Ionicons name="search-outline" size={20} color={theme.textMuted} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Search by skill, major, or name..."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Skills</Text>
                </View>
                <View style={styles.skillsGrid}>
                    {SUGGESTED_SKILLS.map(skill => (
                        <Pressable
                            key={skill}
                            style={[styles.skillChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        >
                            <Text style={[styles.skillText, { color: theme.textSecondary }]}>{skill}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Collaborators</Text>
                    <Pressable><Text style={{ color: theme.primary, fontWeight: '600' }}>See all</Text></Pressable>
                </View>

                {/* Talent List */}
                <View style={styles.talentList}>
                    {isLoading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} color={theme.primary} />
                    ) : talents.length > 0 ? (
                        talents.map((user) => (
                            <Pressable
                                key={user.id}
                                style={[styles.talentCard, { backgroundColor: theme.surface }]}
                            >
                                <View style={[styles.avatar, { backgroundColor: theme.background, overflow: 'hidden' }]}>
                                    {(user.profilePictureUrl || (user as any).profile_picture_url) ? (
                                        <Image
                                            source={{ uri: user.profilePictureUrl || (user as any).profile_picture_url }}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <Ionicons name="person" size={24} color={theme.textMuted} />
                                    )}
                                </View>
                                <View style={styles.talentInfo}>
                                    <Text style={[styles.talentName, { color: theme.text }]}>
                                        {user.fullName || (user as any).full_name}
                                    </Text>
                                    <Text style={[styles.talentMajor, { color: theme.textMuted }]} numberOfLines={1}>
                                        {user.bio || `${user.role} • Active`}
                                    </Text>
                                    <View style={styles.talentSkills}>
                                        {(user.skillTags || (user as any).skill_tags || []).slice(0, 3).map((skill: string) => (
                                            <View key={skill} style={[styles.miniChip, { backgroundColor: theme.primary + '11' }]}>
                                                <Text style={[styles.miniChipText, { color: theme.primary }]}>{skill}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                            </Pressable>
                        ))
                    ) : (
                        <Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 20 }}>No talent found.</Text>
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: Spacing.md,
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: BorderRadius.lg,
        height: 52,
        borderWidth: 1,
        marginBottom: Spacing.xl,
        ...Shadows.small,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: Spacing.xl,
    },
    skillChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    skillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    talentList: {
        gap: 12,
    },
    talentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: BorderRadius.lg,
        ...Shadows.small,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    talentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    talentName: {
        fontSize: 16,
        fontWeight: '700',
    },
    talentMajor: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    talentSkills: {
        flexDirection: 'row',
        gap: 4,
    },
    miniChip: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    miniChipText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
