import React from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Pressable, RefreshControl, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/use-responsive';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useMessagesViewModel } from '@/hooks/view-models/use-messages-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';

export default function MessagesScreen() {
    const { uiState, user, onRefresh } = useMessagesViewModel();
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { horizontalPadding, contentPaddingLeft, contentPaddingRight } = useResponsive();
    const tabBarHeight = useTabBarHeight();

    if (uiState.status === 'guest') {
        return (
            <ThemedView style={styles.centered}>
                <ThemedIcon name="lock-outline" size={64} colorName="outline" />
                <ThemedText variant="headlineSmall" style={{ marginTop: Spacing.lg, fontWeight: '800' }}>
                    Sign in required
                </ThemedText>
                <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={styles.emptyText}>
                    Please sign in to view your collaborations and messages.
                </ThemedText>
                <PrimaryButton
                    title="Sign In"
                    onPress={() => router.push('/login')}
                    style={{ marginTop: Spacing.xl, width: '100%' }}
                />
            </ThemedView>
        );
    }

    if (uiState.status === 'loading') {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    if (uiState.status === 'error') {
        return (
            <ThemedView style={styles.centered}>
                <ThemedIcon name="alert-circle-outline" size={48} colorName="error" />
                <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={styles.emptyText}>
                    {uiState.message}
                </ThemedText>
                <PrimaryButton title="Try Again" onPress={onRefresh} style={{ marginTop: Spacing.lg }} />
            </ThemedView>
        );
    }

    const isRefreshing = uiState.status === 'content' && !!uiState.isRefreshing;

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding, borderBottomColor: theme.outlineVariant }]}>
                <ThemedText variant="headlineMedium" style={styles.title}>Messages</ThemedText>
            </View>

            {uiState.status === 'empty_inbox' ? (
                <ThemedView style={styles.centered}>
                    <View style={[styles.illustrationContainer, { backgroundColor: theme.primaryContainer + '20' }]}>
                        <ThemedIcon name="chat-processing-outline" size={80} colorName="primary" />
                    </View>
                    <ThemedText variant="titleLarge" style={{ marginTop: Spacing.xl, fontWeight: '800' }}>
                        No messages yet
                    </ThemedText>
                    <ThemedText variant="bodyLarge" colorName="textMuted" align="center" style={styles.emptyDescription}>
                        Your collaborations will appear here. Start by exploring services or gigs in the marketplace.
                    </ThemedText>
                    <PrimaryButton
                        title="Explore Marketplace"
                        onPress={() => router.push('/(tabs)/home')}
                        style={{ marginTop: Spacing.xxl, width: '100%' }}
                    />
                </ThemedView>
            ) : (
                <FlatList
                    data={uiState.data}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    contentContainerStyle={[
                        styles.listContent,
                        { 
                            paddingBottom: tabBarHeight + Spacing.xl,
                            paddingHorizontal: contentPaddingLeft 
                        }
                    ]}
                    ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.chatCard,
                                { 
                                    backgroundColor: pressed ? theme.surfaceVariant : theme.surface,
                                    borderColor: theme.outlineVariant,
                                    shadowColor: '#000',
                                },
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname: '/chat/[id]',
                                    params: { id: item.senderId, listingId: item.listingId },
                                })
                            }
                        >
                            {/* User Avatar */}
                            <ThemedView colorName="surfaceVariant" style={styles.avatarContainer}>
                                {item.senderAvatar ? (
                                    <Image source={{ uri: item.senderAvatar }} style={styles.avatarImage} />
                                ) : (
                                    <ThemedIcon name="account" size={32} colorName="primary" />
                                )}
                            </ThemedView>

                            {/* Message Content */}
                            <View style={styles.chatInfo}>
                                <View style={styles.chatTopRow}>
                                    <ThemedText variant="titleMedium" numberOfLines={1} style={styles.senderName}>
                                        {item.senderName || 'Anonymous'}
                                    </ThemedText>
                                    <ThemedText variant="labelSmall" colorName="textMuted">
                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </ThemedText>
                                </View>

                                {item.listingTitle && (
                                    <View style={styles.contextRow}>
                                        <ThemedIcon name="bookmark-outline" size={12} colorName="primary" />
                                        <ThemedText variant="labelSmall" colorName="primary" numberOfLines={1} style={{ fontWeight: '700' }}>
                                            {item.listingTitle}
                                        </ThemedText>
                                    </View>
                                )}

                                <ThemedText
                                    variant="bodyMedium"
                                    colorName={item.isRead ? 'textSecondary' : 'text'}
                                    numberOfLines={1}
                                    style={[styles.messageSnippet, !item.isRead && { fontWeight: '600' }]}
                                >
                                    {item.message}
                                </ThemedText>
                            </View>
                        </Pressable>
                    )}
                    keyExtractor={(item) => item.id}
                />
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    title: {
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    listContent: {
        paddingTop: Spacing.lg,
    },
    chatCard: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        alignItems: 'center',
        ...Platform.select({
            ios: { ...Shadows.level1 },
            android: { elevation: 2 }
        })
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.full,
    },
    chatInfo: {
        flex: 1,
        marginLeft: Spacing.md,
        justifyContent: 'center',
    },
    chatTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    senderName: {
        fontWeight: '700',
        flex: 1,
        marginRight: Spacing.sm,
    },
    contextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    messageSnippet: {
        marginTop: 2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    illustrationContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyDescription: {
        marginTop: Spacing.md,
        lineHeight: 22,
    },
    emptyText: {
        marginTop: Spacing.md,
        lineHeight: 22,
    },
});
