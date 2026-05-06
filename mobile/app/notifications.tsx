import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/use-responsive';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { horizontalPadding } = useResponsive();

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            <Stack.Screen options={{ title: 'Notifications', headerShown: false }} />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, ...horizontalPadding }]}>
                <View style={styles.headerLeft}>
                    <Pressable 
                        onPress={() => router.back()} 
                        style={({ pressed }) => [
                            styles.backBtn,
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <ThemedIcon name="chevron-left" size={28} />
                    </Pressable>
                    <ThemedText variant="headlineMedium" style={styles.title}>Notifications</ThemedText>
                </View>
            </View>
            
            <ScrollView contentContainerStyle={styles.container}>
                <Animated.View entering={FadeInDown.duration(600)} style={styles.emptyState}>
                    <View style={[styles.illustrationContainer, { backgroundColor: theme.primaryContainer + '20' }]}>
                        <ThemedIcon name="bell-outline" size={80} colorName="primary" />
                    </View>
                    <ThemedText variant="titleLarge" style={styles.emptyTitle}>
                        No notifications yet
                    </ThemedText>
                    <ThemedText variant="bodyLarge" colorName="textMuted" align="center" style={styles.emptyDescription}>
                        When you receive updates about your requests or collaborations, they&apos;ll appear here.
                    </ThemedText>
                    <PrimaryButton
                        title="Explore Marketplace"
                        onPress={() => router.push('/(tabs)/home')}
                        style={styles.exploreBtn}
                    />
                </Animated.View>
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: Spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: Spacing.sm,
        padding: Spacing.xs,
        marginLeft: -Spacing.xs,
    },
    title: {
        fontWeight: '900',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    illustrationContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        marginTop: Spacing.xl,
        fontWeight: '800',
    },
    emptyDescription: {
        marginTop: Spacing.md,
        lineHeight: 22,
        maxWidth: '85%',
    },
    exploreBtn: {
        marginTop: Spacing.xxl,
        width: 'auto',
        minWidth: 200,
        paddingHorizontal: Spacing.xl,
    },
});
