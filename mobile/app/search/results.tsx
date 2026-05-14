import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, FlatList, Pressable, TextInput, StatusBar, Keyboard, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
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
import { Listing, ChatMessage, User } from '@/types';
import { useAuth } from '@/context/auth-context';
import { ListingCard } from '@/components/listing-card';
import { RequestCard } from '@/components/request-card';

/**
 * Search context types:
 * - 'home'       → Search listings (services + requests)
 * - 'messages'   → Search contacts & message threads
 * - 'providers'  → Search providers within a subcategory
 */
export type SearchContext = 'home' | 'messages' | 'providers';

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
    const [activeHomeFilter, setActiveHomeFilter] = useState<'All' | 'Services' | 'Requests'>('All');
    const [listingResults, setListingResults] = useState<Listing[]>([]);
    const [messageResults, setMessageResults] = useState<ChatMessage[]>([]);
    const [providerResults, setProviderResults] = useState<any[]>([]);
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
            setListingResults([]);
            setMessageResults([]);
            setProviderResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            if (searchContext === 'home') {
                const listings = await api.searchListings(q);
                setListingResults(listings);
            } else if (searchContext === 'messages') {
                if (token) {
                    const messages = await api.getMessages(token);
                    const qLower = q.toLowerCase();
                    const seenPeers = new Set<string>();
                    const filtered = messages
                        .filter(m => {
                            const matchesName = m.senderName?.toLowerCase().includes(qLower);
                            const matchesMessage = m.message?.toLowerCase().includes(qLower);
                            const matchesListing = m.listingTitle?.toLowerCase().includes(qLower);
                            return matchesName || matchesMessage || matchesListing;
                        })
                        .filter(m => {
                            // Dedupe to one row per conversation peer
                            const peerId = m.senderId === 'mock-user-001' ? m.receiverId : m.senderId;
                            if (seenPeers.has(peerId)) return false;
                            seenPeers.add(peerId);
                            return true;
                        });
                    setMessageResults(filtered);
                }
            } else if (searchContext === 'providers') {
                const subcategory = params.subcategory || '';
                const providers = await api.getProvidersBySubcategory(subcategory);
                const qLower = q.toLowerCase();
                const filtered = providers.filter((p: any) => {
                    const matchesName = p.fullName?.toLowerCase().includes(qLower);
                    const matchesDept = p.department?.toLowerCase().includes(qLower);
                    const matchesTags = p.skillTags?.some((t: string) => t.toLowerCase().includes(qLower));
                    return matchesName || matchesDept || matchesTags;
                });
                setProviderResults(filtered);
            }
        } catch {
            setListingResults([]);
            setMessageResults([]);
            setProviderResults([]);
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

    const handleRecentPress = useCallback((text: string) => {
        setQuery(text);
        performSearch(text);
    }, [performSearch]);

    const clearRecentSearches = useCallback(() => {
        recentSearchesStore[searchContext] = [];
        setQuery(q => q); // force re-render
    }, [searchContext]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setListingResults([]);
        setMessageResults([]);
        setProviderResults([]);
        setHasSearched(false);
    }, []);

    // ── Recent Searches ──────────────────────────────────────────────────
    const recentSearches = recentSearchesStore[searchContext] || [];

    // ── Render Helpers ────────────────────────────────────────────────────

    const renderListingItem = useCallback(({ item }: { item: Listing }) => {
        const CardComponent = item.type === 'service_request' ? RequestCard : ListingCard;
        return (
            <View style={[{ paddingHorizontal: contentPaddingLeft }]}>
                <CardComponent
                    listing={item}
                    onPress={() => {
                        addRecentSearch(searchContext, item.title);
                        router.push({ pathname: '/listing/[id]', params: { id: item.id } });
                    }}
                />
            </View>
        );
    }, [contentPaddingLeft, searchContext, router]);

    const renderMessageItem = useCallback(({ item }: { item: ChatMessage }) => {
        const peerId = item.senderId === 'mock-user-001' ? item.receiverId : item.senderId;
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.chatRow,
                    { paddingHorizontal: contentPaddingLeft },
                    pressed && { backgroundColor: theme.surfaceVariant },
                ]}
                onPress={() => {
                    addRecentSearch(searchContext, item.senderName || '');
                    router.push({
                        pathname: '/chat/[id]',
                        params: { id: peerId, listingId: item.listingId },
                    });
                }}
            >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: theme.surfaceVariant }]}>
                    {item.senderAvatar ? (
                        <ExpoImage
                            source={item.senderAvatar}
                            style={styles.avatarImage}
                            cachePolicy="disk"
                            transition={200}
                        />
                    ) : (
                        <ThemedText variant="titleMedium" colorName="primary" style={{ fontWeight: 'bold' }}>
                            {(item.senderName || 'C').charAt(0).toUpperCase()}
                        </ThemedText>
                    )}
                </View>

                {/* Content */}
                <View style={styles.chatContent}>
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

                    {item.listingTitle && (
                        <View style={styles.contextRowMsg}>
                            <ThemedIcon name="bookmark-outline" size={11} colorName="primary" />
                            <ThemedText variant="labelSmall" colorName="primary" numberOfLines={1} style={styles.contextLabel}>
                                {item.listingTitle}
                            </ThemedText>
                        </View>
                    )}

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
        );
    }, [contentPaddingLeft, theme.surfaceVariant, searchContext, router]);

    const renderProviderItem = useCallback(({ item }: { item: User }) => (
        <View style={styles.providerWrapper}>
            <Pressable
                onPress={() => {
                    addRecentSearch(searchContext, item.fullName);
                    router.push({ pathname: '/profile/[id]', params: { id: item.id } });
                }}
                style={[
                    styles.providerCard,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.outlineVariant,
                        borderWidth: 1,
                    }
                ]}
            >
                <View style={styles.providerLayout}>
                    {/* Left: Profile Image */}
                    <View style={[styles.providerLeft, { borderRightColor: theme.outlineVariant }]}>
                        <Image
                            source={{ uri: item.profilePictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
                            style={styles.providerImage}
                        />
                    </View>

                    {/* Right: Name & Skills */}
                    <View style={styles.providerRight}>
                        <ThemedText variant="titleMedium" style={styles.providerName}>
                            {item.fullName}
                        </ThemedText>
                        <View style={styles.providerInfoRow}>
                            <ThemedText variant="labelMedium" colorName="textMuted" style={styles.providerDept}>
                                {item.department || 'Expert'}
                            </ThemedText>
                            {item.username && (
                                <ThemedText variant="labelSmall" colorName="primary" style={styles.usernameText}>
                                    @{item.username}
                                </ThemedText>
                            )}
                        </View>
                        <View style={styles.providerTags}>
                            {item.skillTags?.slice(0, 3).map((tag: string, idx: number) => (
                                <View key={idx} style={[styles.providerTagPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0' }]}>
                                    <ThemedText variant="labelSmall" colorName="textMuted">{tag}</ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    ), [theme.surface, theme.outlineVariant, isDark, searchContext, router]);

    // ── Render the correct FlatList based on context ──────────────────────
    const renderResultsList = () => {
        if (searchContext === 'home') {
            const filteredListings = listingResults.filter(l => {
                if (activeHomeFilter === 'All') return true;
                if (activeHomeFilter === 'Services') return l.type === 'service_offer';
                if (activeHomeFilter === 'Requests') return l.type === 'service_request';
                return true;
            });

            return (
                <FlatList
                    data={filteredListings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderListingItem}
                    contentContainerStyle={[styles.resultsList, { paddingBottom: insets.bottom + Spacing.xl }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState()}
                />
            );
        }

        if (searchContext === 'messages') {
            return (
                <FlatList
                    data={messageResults}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessageItem}
                    contentContainerStyle={[styles.resultsList, { paddingBottom: insets.bottom + Spacing.xl }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => (
                        <View style={{ marginLeft: contentPaddingLeft + 52 + Spacing.md }}>
                            <View style={[styles.divider, { backgroundColor: theme.outlineVariant }]} />
                        </View>
                    )}
                    ListEmptyComponent={renderEmptyState()}
                />
            );
        }

        if (searchContext === 'providers') {
            return (
                <FlatList
                    data={providerResults}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProviderItem}
                    contentContainerStyle={[styles.resultsList, { paddingBottom: insets.bottom + Spacing.xl }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState()}
                />
            );
        }

        return null;
    };

    const renderEmptyState = () => {
        if (!hasSearched || isSearching) return null;
        return (
            <View style={styles.emptyResults}>
                <View style={[styles.illustrationContainer, { backgroundColor: theme.primaryContainer + '20' }]}>
                    <ThemedIcon name="magnify-close" size={64} colorName="primary" />
                </View>
                <ThemedText variant="titleLarge" style={{ marginTop: Spacing.xl, fontWeight: '800' }}>
                    No results found
                </ThemedText>
                <ThemedText variant="bodyLarge" colorName="textMuted" align="center" style={styles.emptyDescription}>
                    We couldn't find anything matching "{query}". Try a different search term or check your spelling.
                </ThemedText>
            </View>
        );
    };

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
                            <Pressable onPress={clearSearch}>
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

                {/* Filter Pills (only for home context) */}
                {searchContext === 'home' && hasSearched && (
                    <View style={{ marginTop: Spacing.sm }}>
                        <HomeFilterPills 
                            activeFilter={activeHomeFilter} 
                            onFilterChange={setActiveHomeFilter} 
                        />
                    </View>
                )}
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
                            <View style={[styles.illustrationContainer, { backgroundColor: theme.primaryContainer + '10' }]}>
                                <ThemedIcon name="text-search" size={48} colorName="textMuted" />
                            </View>
                            <ThemedText variant="titleMedium" style={{ marginTop: Spacing.lg, fontWeight: '700' }}>
                                No recent searches
                            </ThemedText>
                            <ThemedText variant="bodyMedium" colorName="textMuted" align="center" style={{ marginTop: Spacing.sm }}>
                                Your search history will appear here.
                            </ThemedText>
                        </View>
                    )}
                </View>
            ) : (
                renderResultsList()
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
    emptyResults: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: Spacing.xl,
    },
    illustrationContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyDescription: {
        marginTop: Spacing.md,
        lineHeight: 22,
    },
    pillsContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
    },
    pill: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    pillText: {
        fontWeight: '600',
    },

    // ── Messages-style chat rows ─────────────────────────────────────────
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
    contextRowMsg: {
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

    // ── Provider-style cards ─────────────────────────────────────────────
    providerWrapper: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
    },
    providerCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    providerLayout: {
        flexDirection: 'row',
        height: 120,
    },
    providerLeft: {
        width: 110,
        borderRightWidth: 1,
    },
    providerRight: {
        flex: 1,
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    providerImage: {
        width: '100%',
        height: '100%',
    },
    providerName: {
        fontWeight: '700',
        fontSize: 17,
    },
    providerInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    providerDept: {
        fontSize: 13,
    },
    usernameText: {
        fontWeight: '600',
    },
    providerTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 10,
    },
    providerTagPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
});

const HomeFilterPills = React.memo(({ activeFilter, onFilterChange }: { activeFilter: 'All' | 'Services' | 'Requests', onFilterChange: (filter: 'All' | 'Services' | 'Requests') => void }) => {
    const { theme } = useTheme();
    const filters: ('All' | 'Services' | 'Requests')[] = ['All', 'Services', 'Requests'];
  
    return (
      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
        keyExtractor={(item) => item}
        renderItem={({ item: filter }) => {
          const isSelected = activeFilter === filter;
          return (
            <Pressable
              style={[
                styles.pill,
                { borderColor: theme.outlineVariant },
                isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => onFilterChange(filter)}
            >
              <ThemedText
                variant="labelLarge"
                style={[styles.pillText, isSelected && { color: theme.onPrimary }]}
                colorName={isSelected ? undefined : 'textMuted'}
              >
                {filter}
              </ThemedText>
            </Pressable>
          );
        }}
      />
    );
});
HomeFilterPills.displayName = 'HomeFilterPills';
