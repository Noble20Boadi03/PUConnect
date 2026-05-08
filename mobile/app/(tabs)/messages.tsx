import React, { useCallback } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/use-responsive';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useMessagesViewModel } from '@/hooks/view-models/use-messages-view-model';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useAuth } from '@/context/auth-context';

export default function MessagesScreen() {
    const { uiState, onRefresh } = useMessagesViewModel();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { horizontalPadding, contentPaddingLeft } = useResponsive();
    const { token, user } = useAuth();
    const tabBarHeight = useTabBarHeight();

    const isAdmin = user?.role === 'admin';

    const handleChatPress = useCallback((item: any) => {
        router.push({
            pathname: '/chat/[id]',
            params: { id: item.peerId || item.senderId, listingId: item.listingId },
        });
    }, []);

    const renderChatItem = useCallback(({ item }: { item: any }) => (
        <Pressable
            style={({ pressed }) => [
                styles.chatRow,
                { paddingHorizontal: contentPaddingLeft },
                pressed && { backgroundColor: theme.surfaceVariant },
            ]}
            onPress={() => handleChatPress(item)}
        >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: theme.surfaceVariant }]}>
                {item.senderAvatar ? (
                    <Image 
                        source={item.senderAvatar} 
                        style={styles.avatarImage} 
                        cachePolicy="disk"
                        transition={200}
                    />
                ) : (
                    <ThemedIcon name="account" size={28} colorName="primary" />
                )}
            </View>

            {/* Content */}
            <View style={styles.chatContent}>
                {/* Top row: Name + Time */}
                <View style={styles.topRow}>
                    <ThemedText
                        variant="titleMedium"
                        numberOfLines={1}
                        style={[styles.senderName, !item.isRead && { fontWeight: '800' }]}
                    >
                        {item.senderName || 'Anonymous'}
                    </ThemedText>
                    <ThemedText variant="labelSmall" colorName="textMuted" style={styles.timestamp}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                </View>

                {/* Middle row: Listing context */}
                {item.listingTitle && (
                    <View style={styles.contextRow}>
                        <ThemedIcon name="bookmark-outline" size={11} colorName="primary" />
                        <ThemedText variant="labelSmall" colorName="primary" numberOfLines={1} style={styles.contextLabel}>
                            {item.listingTitle}
                        </ThemedText>
                    </View>
                )}

                {/* Bottom row: Message snippet */}
                <ThemedText
                    variant="bodyMedium"
                    colorName={item.isRead ? 'textMuted' : 'textSecondary'}
                    numberOfLines={1}
                    style={[!item.isRead && { fontWeight: '600' }]}
                >
                    {item.message}
                </ThemedText>
            </View>
        </Pressable>
    ), [contentPaddingLeft, theme.surfaceVariant, handleChatPress]);


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
            <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, ...horizontalPadding }]}>
                <ThemedText variant="headlineMedium" style={styles.title}>Messages</ThemedText>
                <View style={styles.headerActions}>
                    {isAdmin && (
                        <Pressable
                            style={styles.iconBtn}
                            onPress={() => router.push('/(tabs)/admin')}
                        >
                            <ThemedIcon name="shield-check-outline" size={24} />
                        </Pressable>
                    )}
                    <Pressable
                        style={styles.iconBtn}
                        onPress={() => router.push({ pathname: '/search/results', params: { context: 'messages' } })}
                    >
                        <ThemedIcon name="magnify" size={24} />
                    </Pressable>
                    <Pressable
                        style={styles.iconBtn}
                        onPress={() => router.push('/notifications')}
                    >
                        <ThemedIcon name="bell-outline" size={24} />
                    </Pressable>
                </View>
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
                        Your collaborations will appear here. Start by exploring services or requests in the marketplace.
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
                    contentContainerStyle={{
                        paddingBottom: tabBarHeight + Spacing.xl,
                    }}
                    ItemSeparatorComponent={() => (
                        <View style={{ marginLeft: contentPaddingLeft + 60 + Spacing.md }}>
                            <View style={[styles.divider, { backgroundColor: theme.outlineVariant }]} />
                        </View>
                    )}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    removeClippedSubviews={true}
                    initialNumToRender={10}
                    windowSize={5}
                />
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: Spacing.sm,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    title: {
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    iconBtn: {
        padding: Spacing.xs,
    },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
    },
    chatContent: {
        flex: 1,
        marginLeft: Spacing.md,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    senderName: {
        fontWeight: '600',
        flex: 1,
        marginRight: Spacing.sm,
    },
    timestamp: {
        flexShrink: 0,
    },
    contextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 1,
    },
    contextLabel: {
        fontWeight: '700',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
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
