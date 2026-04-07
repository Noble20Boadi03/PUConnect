import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const category = CAMPUS_CATEGORIES.find(c => c.id === id);

    if (!category) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background, paddingTop: insets.top }]}>
                <Text style={{ color: theme.text }}>Category not found</Text>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: (theme as any).discoveryPrimary }}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                    <Ionicons name="search-outline" size={24} color={theme.text} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero section */}
                <View style={styles.heroSection}>
                    <Ionicons name={category.icon as any} size={80} color={theme.textSecondary} />
                    <Text style={[styles.title, { color: theme.text }]}>{category.title}</Text>
                    <Text style={[styles.tagline, { color: theme.textMuted }]}>{category.tagline}</Text>
                </View>

                {/* Subcategories */}
                {category.groups.map((group, groupIdx) => (
                    <View key={groupIdx} style={styles.groupContainer}>
                        <Text style={[styles.groupHeader, { color: theme.textMuted }]}>{group.header}</Text>
                        {group.items.map((item, itemIdx) => (
                            <Pressable 
                                key={itemIdx} 
                                style={[styles.itemRow, { borderBottomColor: theme.border }]}
                                onPress={() => router.push({
                                    pathname: `/search/listings/${item.title}`,
                                    params: { 
                                        category: category.title,
                                        description: item.description 
                                    }
                                })}
                            >
                                <View style={styles.itemTitleContainer}>
                                    <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                                    {item.isNew && (
                                        <View style={styles.newBadge}>
                                            <Text style={styles.newBadgeText}>NEW</Text>
                                        </View>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                            </Pressable>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: 10,
    },
    iconBtn: {
        padding: 8,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: Spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: 16,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 15,
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    groupContainer: {
        marginTop: 16,
    },
    groupHeader: {
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: Spacing.lg,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
    },
    itemTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    itemTitle: {
        fontSize: 17,
        fontWeight: '500',
    },
    newBadge: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    }
});
