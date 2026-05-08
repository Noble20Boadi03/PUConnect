import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, FlatList, Pressable, TextInput, StatusBar, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useResponsive } from '@/hooks/use-responsive';
import { api } from '@/services/api';
import { ChatMessage } from '@/types';
import { useAuth } from '@/context/auth-context';

/**
 * Search context types:
 * - 'home'       → Search listings (services + requests)
 * - 'messages'   → Search contacts & message threads
 * - 'providers'  → Search providers within a subcategory
 */
export type SearchContext = 'home' | 'messages' | 'providers';

interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    type: 'listing' | 'contact' | 'provider';
    data: any;
}

// Simple in-memory recent searches (per context)
const recentSearchesStore: Record<string, string[]> = {
    home: ['Logo Design', 'Tutoring', 'Photography'],
    messages: ['Alex', 'Jordan'],
    providers: ['Design', 'Development'],
};

function addRecentSearch(context: string, query: string) {
    if (!query.trim()) return;
    const list = recentSearchesStore[context] || [];
    const filtered = list.filter(s => s.toLowerCase() !== query.toLowerCase());
    filtered.unshift(query.trim());
    recentSearchesStore[context] = filtered.slice(0, 8);
}

export default function UniversalSearchScreen() {
    const params = useLocalSearchParams<{
        context?: string;
        subcategory?: string;
        category?: string;
        q?: string;
    }>();

    const searchContext = (params.context as SearchContext) || 'home';
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { token } = useAuth();
    const insets = useSafeAreaInsets();
    const { contentPaddingLeft, contentPaddingRight } = useResponsive();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

    const [query, setQuery] = useState(params.q || '');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-focus input on mount
    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 300);
        return () => clearTimeout(timer);
    }, []);

    const getPlaceholder = (): string => {
        switch (searchContext) {
            case 'messages': return 'Search contacts & messages...';
            case 'providers': return `Search providers...`;
            default: return 'Search services & requests...';
        }
    };

    const getContextLabel = (): string => {
        switch (searchContext) {
            case 'messages': return 'Messages';
            case 'providers': return params.subcategory || 'Providers';
            default: return 'Marketplace';
        }
    };

    // ── Search Logic ─────────────────────────────────────────────────────────
    const performSearch = useCallback(async (searchQuery: string) => {
        const q = searchQuery.trim();
        if (!q) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            let mapped: SearchResult[] = [];

            if (searchContext === 'home') {
                // Search listings
                const listings = await api.searchListings(q);
                mapped = listings.map(l => ({
                    id: l.id,
                    title: l.title,
                    subtitle: `${l.category}${l.price ? ` · GH₵${l.price}` : l.budget ? ` · Budget: GH₵${l.budget}` : ''}`,
                    icon: l.type === 'service_request' ? 'hand-extended-outline' : 'briefcase-outline',
                    type: 'listing' as const,
                    data: l,
                }));
            } else if (searchContext === 'messages') {
                // Search message contacts/threads
                if (token) {
                    const messages = await api.getMessages(token);
                    const qLower = q.toLowerCase();
                    // Dedupe by sender, filter by name or message content
                    const seenPeers = new Set<string>();
                    mapped = messages
                        .filter(m => {
                            const matchesName = m.senderName?.toLowerCase().includes(qLower);
                            const matchesMessage = m.message?.toLowerCase().includes(qLower);
                            const matchesListing = m.listingTitle?.toLowerCase().includes(qLower);
                            return matchesName || matchesMessage || matchesListing;
                        })
                        .filter(m => {
                            const peerId = m.senderId === 'mock-user-001' ? m.receiverId : m.senderId;
                            if (seenPeers.has(peerId)) return false;
                            seenPeers.add(peerId);
                            return true;
                        })
                        .map(m => ({
                            id: m.id,
                            title: m.senderName || 'Contact',
                            subtitle: m.listingTitle ? `Re: ${m.listingTitle}` : m.message,
                            icon: 'account-outline',
                            type: 'contact' as const,
                            data: m,
                        }));
                }
            } else if (searchContext === 'providers') {
                // Search providers within current subcategory
                const subcategory = params.subcategory || '';
                const providers = await api.getProvidersBySubcategory(subcategory);
                const qLower = q.toLowerCase();
                mapped = providers
                    .filter((p: any) => {
                        const matchesName = p.fullName?.toLowerCase().includes(qLower);
                        const matchesDept = p.department?.toLowerCase().includes(qLower);
                        const matchesTags = p.skillTags?.some((t: string) => t.toLowerCase().includes(qLower));
                        return matchesName || matchesDept || matchesTags;
                    })
                    .map((p: any) => ({
                        id: p.id,
                        title: p.fullName,
                        subtitle: `${p.department || 'Expert'}${p.skillTags?.length ? ' · ' + p.skillTags.slice(0, 2).join(', ') : ''}`,
                        icon: 'account-outline',
                        type: 'provider' as const,
                        data: p,
                    }));
            }

            setResults(mapped);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchContext, token, params.subcategory]);

    // Debounced search
    const onChangeText = useCallback((text: string) => {
        setQuery(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(text), 350);
    }, [performSearch]);

    const onSubmitSearch = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        addRecentSearch(searchContext, query);
        performSearch(query);
        Keyboard.dismiss();
    }, [query, searchContext, performSearch]);

    // ── Result Press Handlers ─────────────────────────────────────────────
    const handleResultPress = useCallback((item: SearchResult) => {
        addRecentSearch(searchContext, item.title);
        Keyboard.dismiss();

        if (item.type === 'listing') {
            router.push({ pathname: '/listing/[id]', params: { id: item.id } });
        } else if (item.type === 'contact') {
            const msg = item.data as ChatMessage;
            const peerId = msg.senderId === 'mock-user-001' ? msg.receiverId : msg.senderId;
            router.push({
                pathname: '/chat/[id]',
                params: { id: peerId, listingId: msg.listingId },
            });
        } else if (item.type === 'provider') {
            router.push({ pathname: '/profile/[id]', params: { id: item.id } });
        }
    }, [searchContext, router]);

    const handleRecentPress = useCallback((text: string) => {
        setQuery(text);
        performSearch(text);
    }, [performSearch]);

    const clearRecentSearches = useCallback(() => {
        recentSearchesStore[searchContext] = [];
        // Force re-render
        setQuery(q => q);
    }, [searchContext]);

    // ── Recent Searches ──────────────────────────────────────────────────
    const recentSearches = recentSearchesStore[searchContext] || [];

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                translucent
                backgroundColor="transparent"
            />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Search Header */}
            <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                <View style={[styles.searchRow, horizontalPadding]}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <ThemedIcon name="arrow-left" size={24} />
                    </Pressable>

                    <View style={[styles.searchInputContainer, { backgroundColor: theme.surfaceVariant }]}>
                        <ThemedIcon name="magnify" size={20} colorName="textMuted" />
                        <TextInput
                            ref={inputRef}
                            value={query}
                            onChangeText={onChangeText}
                            onSubmitEditing={onSubmitSearch}
                            placeholder={getPlaceholder()}
                            placeholderTextColor={theme.textMuted}
                            returnKeyType="search"
                            style={[styles.searchInput, { color: theme.text }]}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }}>
                                <ThemedIcon name="close-circle" size={18} colorName="textMuted" />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Context Badge */}
                <View style={[styles.contextRow, horizontalPadding]}>
                    <View style={[styles.contextBadge, { backgroundColor: theme.primaryContainer }]}>
                        <ThemedIcon
                            name={searchContext === 'messages' ? 'chat-outline' : searchContext === 'providers' ? 'account-group-outline' : 'store-outline'}
                            size={14}
                            colorName="primary"
                        />
                        <ThemedText variant="labelSmall" colorName="primary" style={{ fontWeight: '700' }}>
                            Searching in {getContextLabel()}
                        </ThemedText>
                    </View>
                </View>
            </ThemedView>

            {/* Content */}
            {!hasSearched && query.length === 0 ? (
                /* Recent Searches */
                <View style={[styles.recentContainer, horizontalPadding]}>
                    <View style={styles.recentHeader}>
                        <ThemedText variant="titleMedium" style={{ fontWeight: '700' }}>
                            Recent Searches
                        </ThemedText>
                        {recentSearches.length > 0 && (
                            <Pressable onPress={clearRecentSearches}>
                                <ThemedText variant="labelMedium" colorName="primary">Clear</ThemedText>
                            </Pressable>
                        )}
                    </View>

                    {recentSearches.length > 0 ? (
                        recentSearches.map((text, idx) => (
                            <Pressable
                                key={`recent-${idx}`}
                                style={styles.recentItem}
                                onPress={() => handleRecentPress(text)}
                            >
                                <ThemedIcon name="history" size={20} colorName="textMuted" />
                                <ThemedText variant="bodyLarge" style={styles.recentText}>{text}</ThemedText>
                                <ThemedIcon name="arrow-top-left" size={18} colorName="textMuted" />
                            </Pressable>
                        ))
                    ) : (
                        <View style={styles.emptyRecent}>
                            <ThemedIcon name="text-search" size={48} colorName="outline" />
                            <ThemedText variant="bodyMedium" colorName="textMuted" align="center" style={{ marginTop: Spacing.md }}>
                                Your recent searches will appear here
                            </ThemedText>
                        </View>
                    )}
                </View>
            ) : (
                /* Search Results */
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.resultsList,
                        { paddingBottom: insets.bottom + Spacing.xl },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.resultItem,
                                horizontalPadding,
                                pressed && { backgroundColor: theme.surfaceVariant },
                            ]}
                            onPress={() => handleResultPress(item)}
                        >
                            <View style={[styles.resultIcon, { backgroundColor: theme.primaryContainer }]}>
                                <ThemedIcon name={item.icon as any} size={22} colorName="primary" />
                            </View>
                            <View style={styles.resultContent}>
                                <ThemedText variant="titleSmall" style={{ fontWeight: '600' }} numberOfLines={1}>
                                    {item.title}
                                </ThemedText>
                                <ThemedText variant="bodySmall" colorName="textMuted" numberOfLines={1}>
                                    {item.subtitle}
                                </ThemedText>
                            </View>
                            <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        hasSearched && !isSearching ? (
                            <View style={styles.emptyResults}>
                                <ThemedIcon name="magnify-close" size={56} colorName="outline" />
                                <ThemedText variant="titleMedium" style={{ marginTop: Spacing.lg, fontWeight: '700' }}>
                                    No results found
                                </ThemedText>
                                <ThemedText variant="bodyMedium" colorName="textMuted" align="center" style={{ marginTop: Spacing.sm }}>
                                    Try a different search term or check your spelling
                                </ThemedText>
                            </View>
                        ) : null
                    }
                />
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingBottom: Spacing.sm,
        zIndex: 10,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        height: 46,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    contextRow: {
        flexDirection: 'row',
        marginTop: Spacing.sm,
    },
    contextBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    recentContainer: {
        paddingTop: Spacing.xl,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.md,
    },
    recentText: {
        flex: 1,
    },
    emptyRecent: {
        alignItems: 'center',
        paddingTop: Spacing.huge,
    },
    resultsList: {
        paddingTop: Spacing.sm,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.md,
    },
    resultIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultContent: {
        flex: 1,
        gap: 2,
    },
    emptyResults: {
        alignItems: 'center',
        paddingTop: Spacing.huge * 2,
        paddingHorizontal: Spacing.xl,
    },
});
