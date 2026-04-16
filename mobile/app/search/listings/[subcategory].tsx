import React from 'react';
import { StyleSheet, View, FlatList, Pressable, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Listing } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useSubcategoryViewModel } from '@/hooks/view-models/use-subcategory-view-model';
import { useResponsive } from '@/hooks/use-responsive';

export default function SubcategoryListingsScreen() {
    const { subcategory: subcategoryTitle, category, description } = useLocalSearchParams<{ 
        subcategory: string, 
        category?: string, 
        description?: string 
    }>();
    
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { contentPaddingLeft, contentPaddingRight } = useResponsive();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

    const {
        uiState,
        activeFilters,
        activeModalFilter,
        setActiveModalFilter,
        selectFilter,
        clearFilter,
        onRefresh,
    } = useSubcategoryViewModel({ subcategoryTitle: subcategoryTitle as string, category: category as string | undefined });

    if (uiState.status === 'loading') {
        return (
            <ScreenLayout>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </ScreenLayout>
        );
    }

    if (uiState.status === 'error') {
        return (
            <ScreenLayout>
                <View style={styles.centered}>
                    <ThemedIcon name="alert-circle-outline" size={48} colorName="error" />
                    <ThemedText variant="bodyLarge" style={{ marginTop: Spacing.md }}>{uiState.message}</ThemedText>
                </View>
            </ScreenLayout>
        );
    }

    const listings = uiState.status === 'content' ? uiState.data.listings : [];
    const filtersConfig = uiState.status === 'content' ? uiState.data.filtersConfig : [];
    const isRefreshing = uiState.status === 'content' && !!uiState.isRefreshing;

    const handleSelectOption = (filterLabel: string, optionValue: string) => {
        selectFilter(filterLabel, optionValue);
    };

    const handleClearFilter = (filterLabel: string) => {
        clearFilter(filterLabel);
    };

    const isAllSelected = Object.keys(activeFilters).length === 0;

    const renderHeader = () => (
        <View style={[styles.headerContent, horizontalPadding]}>
            <ThemedText variant="headlineSmall" style={[styles.title, { paddingHorizontal: Spacing.md }]}>{subcategoryTitle}</ThemedText>
            {description && (
                <ThemedText variant="bodySmall" colorName="textMuted" style={[styles.description]}>{description}</ThemedText>
            )}
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ ...horizontalPadding, paddingBottom: 4 }}
            >
                {/* 'All' Filter Pill */}
                <Pressable 
                    style={[
                        styles.filterPill, 
                        { borderColor: theme.outlineVariant },
                        isAllSelected && { borderColor: theme.primary, borderWidth: 1.5, backgroundColor: theme.primary }
                    ]}
                    onPress={() => clearFilter('__all__')}
                >
                    <ThemedText 
                        variant="labelLarge"
                        lightColor={isAllSelected ? theme.onPrimary : theme.textMuted}
                        darkColor={isAllSelected ? theme.onPrimary : theme.textMuted}
                        style={isAllSelected && { fontWeight: '800' }}
                    >
                        All
                    </ThemedText>
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
                                { borderColor: theme.outlineVariant },
                                isSelected && { borderColor: theme.primary, borderWidth: 1.5, backgroundColor: theme.surfaceVariant }
                            ]}
                            onPress={() => isSelected ? handleClearFilter(filter.filter_label) : setActiveModalFilter(filter)}
                        >
                            <ThemedText 
                                variant="labelLarge"
                                colorName={isSelected ? "primary" : "textMuted"}
                                style={isSelected && { fontWeight: '800' }}
                            >
                                {isSelected ? selectedVal : filter.filter_label}
                            </ThemedText>
                            {isSelected ? (
                                <View style={styles.clearIconWrapper}>
                                    <ThemedIcon name="close" size={14} colorName="primary" />
                                </View>
                            ) : (
                                <ThemedIcon 
                                    name="chevron-down" 
                                    size={12} 
                                    colorName="textMuted" 
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
        onPress={() => router.push({
            pathname: "/listing/[id]",
            params: { id: item.id }
        })}
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
                            <ThemedIcon name="star" size={14} lightColor="#fbbf24" darkColor="#fbbf24" />
                            <ThemedText variant="labelLarge" style={styles.ratingText}>
                                {item.average_rating ? item.average_rating.toFixed(1) : '5.0'}
                            </ThemedText>
                            <ThemedText variant="labelSmall" colorName="textMuted">
                                ({item.review_count || '0'})
                            </ThemedText>
                        </View>
                        <Pressable>
                            <ThemedIcon name="heart-outline" size={20} colorName="textMuted" />
                        </Pressable>
                    </View>
                    
                    <ThemedText variant="titleSmall" numberOfLines={2} style={styles.serviceTitle}>
                        {item.title}
                    </ThemedText>
                    
                    <View style={styles.bottomRow}>
                        <ThemedText variant="labelSmall" colorName="textMuted">From</ThemedText>
                        <ThemedText variant="titleSmall" colorName="primary">
                            GH₵ {item.price || item.budget || '0'}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </Pressable>
    );

    return (
        <ScreenLayout scrollable={false} padding="none" withSafeArea={false}>
            {/* Nav Header */}
            <View style={[styles.navHeader, { paddingTop: insets.top + 5, ...horizontalPadding }]}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <ThemedIcon name="chevron-left" size={24} />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                    <ThemedIcon name="magnify" size={24} />
                </Pressable>
            </View>

            <FlatList
                data={listings}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing.xl }]}
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedIcon name="file-document-outline" size={64} colorName="outline" />
                        <ThemedText variant="bodyLarge" colorName="textMuted" align="center" style={styles.emptyText}>
                            No students offering this service yet.
                        </ThemedText>
                    </View>
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
                    <ThemedView style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.outlineVariant }]}>
                            <ThemedText variant="titleLarge">
                                Select {activeModalFilter?.filter_label}
                            </ThemedText>
                            <Pressable onPress={() => setActiveModalFilter(null)} style={styles.iconBtn}>
                                <ThemedIcon name="close" size={24} />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {activeModalFilter?.filter_options?.map((option: string, idx: number) => (
                                <Pressable 
                                    key={idx}
                                    style={[styles.modalOption, { borderBottomColor: theme.outlineVariant }]}
                                    onPress={() => handleSelectOption(activeModalFilter.filter_label, option)}
                                >
                                    <ThemedText variant="bodyLarge">{option}</ThemedText>
                                    <ThemedIcon name="chevron-right" colorName="textMuted" size={20} />
                                </Pressable>
                            ))}
                        </ScrollView>
                    </ThemedView>
                </View>
            </Modal>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    navHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    description: {
        fontSize: 15,
        marginTop: 4,
        lineHeight: 20,
    },
    filterContainer: {
        marginTop: 16,
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
        ...Shadows.level2,
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});
