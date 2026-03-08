import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Pressable, Text, Image } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import { useAuth } from '@/context/auth-context';
import { ChatMessage } from '@/types';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        if (token) {
            fetchMessages();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchMessages = async () => {
        try {
            const data = await api.getMessages(token!);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <ThemedView style={[styles.centered, { backgroundColor: theme.background }]}>
                <Ionicons name="lock-closed-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Please sign in to view your collaborations.</Text>
            </ThemedView>
        );
    }

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
                <Pressable style={[styles.newChatBtn, { backgroundColor: theme.primary + '11' }]}>
                    <Ionicons name="create-outline" size={20} color={theme.primary} />
                </Pressable>
            </View>

            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [
                            styles.chatItem,
                            { backgroundColor: pressed ? theme.surface : 'transparent' }
                        ]}
                    >
                        <View style={[styles.avatar, { backgroundColor: theme.primary + '22' }]}>
                            <Ionicons name="person" size={24} color={theme.primary} />
                            {!item.isRead && item.senderId !== user?.id && (
                                <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                            )}
                        </View>

                        <View style={styles.chatContent}>
                            <View style={styles.chatHeader}>
                                <Text style={[styles.sender, { color: theme.text }]}>Campus Member {item.senderId.slice(0, 4)}</Text>
                                <Text style={[styles.time, { color: theme.textMuted }]}>
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text numberOfLines={1} style={[
                                styles.lastMessage,
                                { color: item.isRead ? theme.textSecondary : theme.text, fontWeight: item.isRead ? '400' : '600' }
                            ]}>
                                {item.message}
                            </Text>
                        </View>
                    </Pressable>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={theme.textMuted} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No active collaborations yet.</Text>
                        <Pressable style={[styles.browseBtn, { backgroundColor: theme.primary }]}>
                            <Text style={styles.browseBtnText}>Explore Market</Text>
                        </Pressable>
                    </View>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
    },
    newChatBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatItem: {
        flexDirection: 'row',
        padding: Spacing.md,
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
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
        borderColor: '#fff',
    },
    chatContent: {
        flex: 1,
        marginLeft: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: Spacing.md,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    sender: {
        fontWeight: '700',
        fontSize: 16,
    },
    time: {
        fontSize: 12,
    },
    lastMessage: {
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: 16,
        textAlign: 'center',
    },
    browseBtn: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: 12,
        borderRadius: BorderRadius.full,
    },
    browseBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
});
