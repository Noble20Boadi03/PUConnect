import React from 'react';
import { StyleSheet, View, FlatList, Pressable, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { User } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useSubcategoryViewModel } from '@/hooks/view-models/use-subcategory-view-model';
import { useResponsive } from '@/hooks/use-responsive';

export default function SubcategoryListingsScreen() {
    const { subcategory: subcategoryTitle, description, category } = useLocalSearchParams<{ 
        subcategory: string, 
        category?: string, 
        description?: string 
    }>();
    
    const router = useRouter();
    const { theme, isDark } = useTheme();
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

    const providers = uiState.status === 'content' ? uiState.data.providers : [];
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
        <View style={styles.headerSpacer}>
            <View style={[styles.heroSection, horizontalPadding]}>
                <ThemedText variant="headlineSmall" style={styles.heroTitle}>{subcategoryTitle}</ThemedText>
                {description && (
                    <ThemedText variant="bodyMedium" colorName="textMuted" style={styles.description}>
                        {description}
                    </ThemedText>
                )}
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.pillsContainer, { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight }]}
            >
                <Pressable 
                    style={[
                        styles.filterPill, 
                        { borderColor: theme.outlineVariant },
                        isAllSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => clearFilter('__all__')}
                >
                    <ThemedText 
                        variant="labelLarge"
                        style={[styles.pillText, isAllSelected && { color: theme.onPrimary, fontWeight: '800' }]}
                        colorName={isAllSelected ? undefined : "textMuted"}
                    >
                        All
                    </ThemedText>
                </Pressable>

                {filtersConfig.map((filter) => {
                    const selectedVal = activeFilters[filter.filter_label];
                    const isSelected = !!selectedVal;

                    return (
                        <Pressable 
                            key={filter.id}
                            style={[
                                styles.filterPill, 
                                { borderColor: theme.outlineVariant },
                                isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                            ]}
                            onPress={() => isSelected ? handleClearFilter(filter.filter_label) : setActiveModalFilter(filter)}
                        >
                            <ThemedText 
                                variant="labelLarge"
                                style={[styles.pillText, isSelected && { color: theme.onPrimary, fontWeight: '800' }]}
                                colorName={isSelected ? undefined : "textMuted"}
                            >
                                {isSelected ? selectedVal : filter.filter_label}
                            </ThemedText>
                            {!isSelected && (
                                <ThemedIcon 
                                    name="chevron-down" 
                                    size={14} 
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

    const renderItem = ({ item }: { item: User }) => (
       <ProviderCard 
            item={item} 
            theme={theme} 
            isDark={isDark}
            subcategory={subcategoryTitle}
            onPress={() => router.push({
                pathname: "/profile/[id]",
                params: { id: item.id }
            })} 
       />
    );

    return (
        <ScreenLayout padding="none" withSafeArea={false}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <ThemedView style={[styles.fixedHeader, { paddingTop: insets.top + Spacing.sm }]}>
                <View style={[styles.navRow, horizontalPadding]}>
                    <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                        <ThemedIcon name="chevron-left" size={26} />
                    </Pressable>
                    <View />
                    <Pressable style={styles.iconBtn}>
                        <ThemedIcon name="magnify" size={24} />
                    </Pressable>
                </View>
            </ThemedView>

            <FlatList
                data={providers}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent, 
                    { paddingBottom: insets.bottom + Spacing.xl, paddingTop: 100 }
                ]}
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedIcon name="account-search-outline" size={64} colorName="outline" />
                        <ThemedText variant="bodyLarge" colorName="textMuted" align="center" style={styles.emptyText}>
                            No Providers matching this criteria.
                        </ThemedText>
                    </View>
                }
            />

            <Modal
                visible={!!activeModalFilter}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setActiveModalFilter(null)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <ThemedView style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.outlineVariant }]}>
                            <ThemedText variant="titleLarge" style={{ fontWeight: '800' }}>
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

/**
 * Original Style Horizontal Provider Card
 */
function ProviderCard({ item, theme, isDark, subcategory, onPress }: any) {
    return (
        <View style={styles.cardWrapper}>
            <Pressable 
                onPress={onPress}
                style={[
                    styles.card, 
                    { 
                        backgroundColor: theme.surface,
                        borderColor: theme.outlineVariant,
                        borderWidth: 1,
                    }
                ]}
            >
                <View style={styles.cardLayout}>
                    {/* Left: Profile Image Box */}
                    <View style={[styles.leftSection, { borderRightColor: theme.outlineVariant }]}>
                        <Image 
                            source={{ uri: item.profilePictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }} 
                            style={styles.profileImage} 
                        />
                    </View>
                    
                    {/* Right: Name & Skills */}
                    <View style={styles.rightSection}>
                        <ThemedText variant="titleMedium" style={styles.providerName}>
                            {item.fullName}
                        </ThemedText>
                        
                        <ThemedText variant="labelMedium" colorName="textMuted" style={styles.departmentText}>
                            {item.department || 'Expert'}
                        </ThemedText>

                        <View style={styles.tagsRow}>
                            {item.skillTags?.slice(0, 3).map((tag: string, idx: number) => (
                                <View key={idx} style={[styles.tagPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0' }]}>
                                    <ThemedText variant="labelSmall" colorName="textMuted">{tag}</ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingBottom: Spacing.sm,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBtn: {
        padding: 8,
    },
    headerSpacer: {
        paddingBottom: Spacing.md,
    },
    heroSection: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 15,
        marginTop: 6,
        lineHeight: 20,
    },
    pillsContainer: {
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        marginRight: Spacing.sm,
        backgroundColor: 'transparent',
    },
    pillText: {
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 40,
    },
    cardWrapper: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardLayout: {
        flexDirection: 'row',
        height: 120,
    },
    leftSection: {
        width: 110,
        borderRightWidth: 1,
    },
    rightSection: {
        flex: 1,
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    providerName: {
        fontWeight: '700',
        fontSize: 17,
    },
    departmentText: {
        marginTop: 2,
        fontSize: 13,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 10,
    },
    tagPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        minHeight: '40%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: 20,
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
        paddingVertical: 18,
        borderBottomWidth: 1,
    },
});
