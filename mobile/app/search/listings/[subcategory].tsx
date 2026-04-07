import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { api } from '@/services/api';
import { Listing, SubcategoryFilter } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SubcategoryListingsScreen() {
    const { subcategory: subcategoryTitle, category, description } = useLocalSearchParams<{ 
        subcategory: string, 
        category?: string, 
        description?: string 
    }>();
    
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    
    const [listings, setListings] = useState<Listing[]>([]);
    const [filtersConfig, setFiltersConfig] = useState<SubcategoryFilter[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // activeFilters stores selected values. e.g., { "Subject": "Mathematics", "Rating": "4.5+" }
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    
    // Modal state
    const [activeModalFilter, setActiveModalFilter] = useState<SubcategoryFilter | null>(null);

    useEffect(() => {
        fetchData();
    }, [subcategoryTitle, activeFilters]);

    useEffect(() => {
        // Fetch dynamic filters for this subcategory
        const loadFilters = async () => {
            try {
                const filters = await api.getSubcategoryFilters(subcategoryTitle);
                setFiltersConfig(filters);
            } catch (err) {
                console.error('Failed to load subcategory filters', err);
            }
        };
        loadFilters();
    }, [subcategoryTitle]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const apiFilters: any = {
                category: category,
                subcategory: subcategoryTitle,
            };

            // Map selected dynamic filters to API parameters
            Object.entries(activeFilters).forEach(([key, value]) => {
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('rating')) apiFilters.sortBy = 'rating';
                else if (lowerKey.includes('price')) apiFilters.sortBy = 'price';
                else if (lowerKey === 'department') apiFilters.department = value;
                else if (lowerKey === 'academic level' || lowerKey === 'level') apiFilters.level = value;
                else apiFilters.tag = value; // Fallback to tag for other custom filters
            });
            
            const data = await api.getListings(0, 20, apiFilters);
            setListings(data);
        } catch (error) {
            console.error('Error fetching subcategory listings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSelectOption = (filterLabel: string, optionValue: string) => {
        setActiveFilters(prev => ({ ...prev, [filterLabel]: optionValue }));
        setActiveModalFilter(null);
    };

    const handleClearFilter = (filterLabel: string) => {
        const newFilters = { ...activeFilters };
        delete newFilters[filterLabel];
        setActiveFilters(newFilters);
    };

    const isAllSelected = Object.keys(activeFilters).length === 0;

    const renderHeader = () => (
        <View style={styles.headerContent}>
            <Text style={[styles.title, { color: theme.text }]}>{subcategoryTitle}</Text>
            {description && (
                <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>
            )}
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
            >
                {/* 'All' Filter Pill */}
                <Pressable 
                    style={[
                        styles.filterPill, 
                        { borderColor: theme.border },
                        isAllSelected && { borderColor: theme.text, borderWidth: 1.5, backgroundColor: theme.text }
                    ]}
                    onPress={() => setActiveFilters({})}
                >
                    <Text style={[
                        styles.filterText, 
                        { color: isAllSelected ? theme.background : theme.textMuted },
                        isAllSelected && { fontWeight: '800' }
                    ]}>
                        All
                    </Text>
                </Pressable>

                {/* Dynamic Filters */}
                {filtersConfig.map((filter) => {
                    const selectedVal = activeFilters[filter.filter_label];
                    const isSelected = !!selectedVal;

                    return (
                        <Pressable 
                            key={filter.id}
                            style={[
                                styles.filterPill, 
                                { borderColor: theme.border },
                                isSelected && { borderColor: theme.text, borderWidth: 1.5, backgroundColor: theme.surface }
                            ]}
                            onPress={() => isSelected ? handleClearFilter(filter.filter_label) : setActiveModalFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText, 
                                { color: isSelected ? theme.text : theme.textMuted },
                                isSelected && { fontWeight: '800' }
                            ]}>
                                {isSelected ? selectedVal : filter.filter_label}
                            </Text>
                            {isSelected ? (
                                <View style={styles.clearIconWrapper}>
                                    <Ionicons name="close" size={14} color={theme.text} />
                                </View>
                            ) : (
                                <Ionicons 
                                    name="chevron-down" 
                                    size={12} 
                                    color={theme.textMuted} 
                                    style={{ marginLeft: 4 }}
                                />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderItem = ({ item }: { item: Listing }) => (
        <Pressable 
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/listing/${item.id}` as any)}
        >
            <View style={styles.cardContent}>
                {/* Left: Portfoilo/Profile Photo */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: item.media_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=150&auto=format&fit=crop' }} 
                        style={styles.cardImage} 
                    />
                </View>
                
                {/* Right: Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.topRow}>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#fbbf24" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>
                                {item.average_rating ? item.average_rating.toFixed(1) : '5.0'}
                            </Text>
                            <Text style={[styles.reviewCount, { color: theme.textMuted }]}>
                                ({item.review_count || '0'})
                            </Text>
                        </View>
                        <Pressable>
                            <Ionicons name="heart-outline" size={20} color={theme.textMuted} />
                        </Pressable>
                    </View>
                    
                    <Text numberOfLines={2} style={[styles.serviceTitle, { color: theme.text }]}>
                        {item.title}
                    </Text>
                    
                    <View style={styles.bottomRow}>
                        <Text style={[styles.pricePrefix, { color: theme.textMuted }]}>From</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>
                            GH₵ {item.price || item.budget || '0'}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Nav Header */}
            <View style={[styles.navHeader, { paddingTop: insets.top + 5 }]}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                    <Ionicons name="search-outline" size={24} color={theme.text} />
                </Pressable>
            </View>

            <FlatList
                data={listings}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    fetchData();
                }}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="documents-outline" size={64} color={theme.textMuted} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                No students offering this service yet.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={(theme as any).discoveryPrimary || theme.primary} />
                        </View>
                    )
                }
            />

            {/* Filter Options Modal */}
            <Modal
                visible={!!activeModalFilter}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setActiveModalFilter(null)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                Select {activeModalFilter?.filter_label}
                            </Text>
                            <Pressable onPress={() => setActiveModalFilter(null)} style={styles.iconBtn}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {activeModalFilter?.filter_options?.map((option: string, idx: number) => (
                                <Pressable 
                                    key={idx}
                                    style={[styles.modalOption, { borderBottomColor: theme.border }]}
                                    onPress={() => handleSelectOption(activeModalFilter.filter_label, option)}
                                >
                                    <Text style={[styles.modalOptionText, { color: theme.text }]}>{option}</Text>
                                    <Ionicons name="chevron-forward" color={theme.textMuted} size={20} />
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: 8,
    },
    iconBtn: {
        padding: 8,
    },
    headerContent: {
        paddingVertical: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
        paddingHorizontal: Spacing.lg,
    },
    description: {
        fontSize: 15,
        marginTop: 4,
        lineHeight: 20,
        paddingHorizontal: Spacing.lg,
    },
    filterContainer: {
        marginTop: 16,
        paddingHorizontal: Spacing.lg,
        paddingRight: 40,
        paddingBottom: 4,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    clearIconWrapper: {
        marginLeft: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 40,
    },
    card: {
        marginHorizontal: Spacing.lg,
        marginTop: 16,
        borderRadius: BorderRadius.lg,
        ...Shadows.small,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        padding: 12,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
    },
    reviewCount: {
        fontSize: 13,
    },
    serviceTitle: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 6,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    pricePrefix: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
        textAlign: 'center',
    },
    loadingContainer: {
        marginTop: 80,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '40%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    modalScroll: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 10,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '500',
    }
});
