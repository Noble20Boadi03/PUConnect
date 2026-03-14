import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

export default function InsightsScreen() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await api.getSkillGaps();
                setData(response);
            } catch (error) {
                console.error("Failed to fetch skills gaps", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, []);

    const renderCard = (title: string, icon: any, color: string, children: React.ReactNode) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
            </View>
            <View style={styles.cardBody}>
                {children}
            </View>
        </View>
    );

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Market Insights</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Discover trending campus skills and high-demand opportunities.
                    </Text>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                ) : (
                    <>
                        {renderCard(
                            "Trending Skills",
                            "trending-up",
                            theme.primary,
                            data?.trending_skills?.map((item: any, idx: number) => (
                                <View key={idx} style={styles.listItem}>
                                    <View style={styles.listHeader}>
                                        <Text style={[styles.skillName, { color: theme.text }]}>{item.skill}</Text>
                                        <View style={[styles.badge, { backgroundColor: theme.success + '20' }]}>
                                            <Ionicons name="arrow-up" size={12} color={theme.success} />
                                            <Text style={[styles.badgeText, { color: theme.success }]}>{item.growth_percentage}%</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.insightText, { color: theme.textSecondary }]}>{item.insight}</Text>
                                </View>
                            ))
                        )}

                        {renderCard(
                            "High Demand",
                            "flame",
                            "#ef4444", // red
                            data?.high_demand_skills?.map((item: any, idx: number) => (
                                <View key={idx} style={styles.listItem}>
                                    <View style={styles.listHeader}>
                                        <Text style={[styles.skillName, { color: theme.text }]}>{item.skill}</Text>
                                        <Text style={[styles.metricsText, { color: theme.textMuted }]}>
                                            {item.requests_this_month} requests
                                        </Text>
                                    </View>
                                    <View style={styles.barContainer}>
                                        <View style={[styles.barFill, { backgroundColor: '#ef4444', width: `${Math.min(item.demand_score, 100)}%` }]} />
                                    </View>
                                </View>
                            ))
                        )}

                        {renderCard(
                            "Low Supply (Opportunities)",
                            "bulb",
                            "#eab308", // yellow/gold
                            data?.low_supply_opportunities?.map((item: any, idx: number) => (
                                <View key={idx} style={[styles.listItem, { borderBottomWidth: 0 }]}>
                                    <View style={styles.listHeader}>
                                        <Text style={[styles.skillName, { color: theme.text }]}>{item.skill}</Text>
                                        <View style={[styles.badge, { backgroundColor: '#eab30820' }]}>
                                            <Text style={[styles.badgeText, { color: '#eab308' }]}>{item.gap_ratio}x Gap</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.insightText, { color: theme.textSecondary }]}>{item.insight}</Text>
                                    {item.recommendation && (
                                        <View style={[styles.recommendationBox, { backgroundColor: theme.primary + '10' }]}>
                                            <Ionicons name="star" size={14} color={theme.primary} />
                                            <Text style={[styles.recommendationText, { color: theme.primary }]}>
                                                {item.recommendation}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))
                        )}

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textMuted }]}>
                                Generated by AI analyzing {new Date().toLocaleDateString()} campus telemetry.
                            </Text>
                        </View>
                    </>
                )}
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
        marginTop: 6,
    },
    loader: {
        marginTop: 40,
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.medium,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        gap: Spacing.md,
    },
    listItem: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
        paddingBottom: Spacing.md,
        marginBottom: 8,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    skillName: {
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    insightText: {
        fontSize: 13,
        lineHeight: 18,
    },
    metricsText: {
        fontSize: 12,
        fontWeight: '500',
    },
    barContainer: {
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        marginTop: 6,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    recommendationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: BorderRadius.md,
        marginTop: 8,
        gap: 6,
    },
    recommendationText: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    footerText: {
        fontSize: 12,
    }
});
