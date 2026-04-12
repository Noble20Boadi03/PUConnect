import React from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/use-responsive';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useMessagesViewModel } from '@/hooks/view-models/use-messages-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';

export default function MessagesScreen() {
    const { uiState, user, onRefresh } = useMessagesViewModel();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { contentPaddingLeft, contentPaddingRight } = useResponsive();
    const tabBarHeight = useTabBarHeight();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

    if (uiState.status === 'guest') {
        return (
            <ThemedView style={styles.centered}>
                <ThemedIcon name="lock" size={48} colorName="outline" />
                <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={styles.emptyText}>
                    Please sign in to view your collaborations.
                </ThemedText>
                <PrimaryButton
                    title="Sign In"
                    onPress={() => router.push('/login')}
                    style={{ marginTop: Spacing.xl }}
                />
            </ThemedView>
        );
    }

    if (uiState.status === 'empty_inbox') {
        return (
            <ScreenLayout padding="none" withSafeArea={false}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
                    <ThemedText variant="headlineSmall" style={styles.title}>Messages</ThemedText>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Start a conversation"
                        onPress={() => router.push({ pathname: '/search/results', params: { q: '' } })}
                        style={[styles.newChatBtn, { backgroundColor: theme.primaryContainer }]}
                    >
                        <ThemedIcon name="pencil-outline" size={20} colorName="onPrimaryContainer" />
                    </Pressable>
                </View>
                <ThemedView style={styles.centered}>
                    <ThemedIcon name="chat-outline" size={64} colorName="outline" />
                    <ThemedText variant="bodyLarge" colorName="textMuted" align="center" style={styles.emptyText}>
                        No messages yet. Browse listings and send a message to connect.
                    </ThemedText>
                    <PrimaryButton
                        title="Explore Market"
                        onPress={() => router.push('/(tabs)/home')}
                        style={{ marginTop: Spacing.xl }}
                    />
                </ThemedView>
            </ScreenLayout>
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
            </ThemedView>
        );
    }

    const isRefreshing = uiState.isRefreshing;

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
                <ThemedText variant="headlineSmall" style={styles.title}>Messages</ThemedText>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Start a conversation"
                    onPress={() => router.push({ pathname: '/search/results', params: { q: '' } })}
                    style={[styles.newChatBtn, { backgroundColor: theme.primaryContainer }]}
                >
                    <ThemedIcon name="pencil-outline" size={20} colorName="onPrimaryContainer" />
                </Pressable>
            </View>

            <FlatList
                data={uiState.data}
                refreshControl={
                    <RefreshControl refreshing={!!isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [
                            styles.chatItem,
                            { backgroundColor: pressed ? theme.surfaceVariant : 'transparent', ...horizontalPadding },
                        ]}
                        onPress={() =>
                            router.push({
                                pathname: '/chat/[id]',
                                params: { id: item.senderId, listingId: item.listingId },
                            })
                        }
                    >
                        <ThemedView colorName="primaryContainer" style={styles.avatar}>
                            <ThemedIcon name="account" size={24} colorName="onPrimaryContainer" />
                            {!item.isRead && item.senderId !== user?.id && (
                                <View style={[styles.unreadDot, { backgroundColor: theme.primary, borderColor: theme.background }]} />
                            )}
                        </ThemedView>

                        <View style={[styles.chatContent, { borderBottomColor: theme.outlineVariant }]}>
                            <View style={styles.chatHeader}>
                                <ThemedText variant="titleMedium">Campus Member {item.senderId.slice(0, 4)}</ThemedText>
                                <ThemedText variant="labelSmall" colorName="textMuted">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </ThemedText>
                            </View>
                            <ThemedText
                                variant="bodyMedium"
                                colorName={item.isRead ? 'textSecondary' : 'text'}
                                numberOfLines={1}
                                style={{ fontWeight: item.isRead ? '400' : '600' }}
                            >
                                {item.message}
                            </ThemedText>
                        </View>
                    </Pressable>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: tabBarHeight }}
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    title: {
        fontWeight: '800',
    },
    newChatBtn: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatItem: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    chatContent: {
        flex: 1,
        marginLeft: Spacing.md,
        borderBottomWidth: 1,
        paddingBottom: Spacing.md,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        marginTop: Spacing.md,
    },
});
