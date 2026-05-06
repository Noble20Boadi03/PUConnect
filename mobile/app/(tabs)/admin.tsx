import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ThemedIcon, IconName } from '@/components/ui/themed-icon';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AdminScreen() {
    const { theme } = useTheme();

    const stats: { label: string; value: string; icon: IconName; color: string }[] = [
        { label: 'Pending Requests', value: '12', icon: 'clock-outline', color: '#f59e0b' },
        { label: 'Reported Users', value: '3', icon: 'alert-octagon-outline', color: '#ef4444' },
        { label: 'Total Users', value: '248', icon: 'account-group-outline', color: theme.primary },
    ];

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            <ScreenHeader title="Admin Moderation" showBack={false} />
            
            <ScrollView contentContainerStyle={styles.container}>
                <Animated.View entering={FadeInDown.duration(600)} style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                            <View style={[styles.iconBox, { backgroundColor: stat.color + '20' }]}>
                                <ThemedIcon name={stat.icon} size={24} lightColor={stat.color} darkColor={stat.color} />
                            </View>
                            <ThemedText variant="headlineSmall" style={styles.statValue}>{stat.value}</ThemedText>
                            <ThemedText variant="labelMedium" colorName="textMuted">{stat.label}</ThemedText>
                        </View>
                    ))}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
                    <ThemedText variant="titleMedium" style={styles.sectionTitle}>Recent Activity</ThemedText>
                    <View style={[styles.placeholderCard, { backgroundColor: theme.surfaceVariant, borderColor: theme.outlineVariant }]}>
                        <ThemedIcon name="shield-search" size={48} colorName="textMuted" />
                        <ThemedText variant="bodyMedium" colorName="textMuted" style={{ marginTop: Spacing.md }}>
                            No urgent moderation tasks at the moment.
                        </ThemedText>
                    </View>
                </Animated.View>
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.xl,
        paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: {
        fontWeight: '900',
    },
    section: {
        marginTop: Spacing.md,
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: Spacing.md,
    },
    placeholderCard: {
        padding: Spacing.huge,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
