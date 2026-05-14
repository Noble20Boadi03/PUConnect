import React from 'react';
import { StyleSheet, View, FlatList, Pressable, Image, ActivityIndicator, Modal, ScrollView, StatusBar } from 'react-native';
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
import { BlurView } from 'expo-blur';

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

    const handleSelectOption = (filterLabel: string, optionValue: string, isMulti: boolean = false) => {
        selectFilter(filterLabel, optionValue, isMulti);
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
                    const selectedVals = activeFilters[filter.filter_label];
                    const isSelected = selectedVals && selectedVals.length > 0;
                    const pillLabel = isSelected 
                        ? (selectedVals.length === 1 ? selectedVals[0] : `${selectedVals[0]} +${selectedVals.length - 1}`)
                        : filter.filter_label;

                    return (
                        <Pressable 
                            key={filter.id}
                            style={[
                                styles.filterPill, 
                                { borderColor: theme.outlineVariant },
                                isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                            ]}
                            onPress={() => setActiveModalFilter(filter)}
                        >
                            <ThemedText 
                                variant="labelLarge"
                                style={[styles.pillText, isSelected && { color: theme.onPrimary, fontWeight: '800' }]}
                                colorName={isSelected ? undefined : "textMuted"}
                            >
                                {pillLabel}
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
            <StatusBar 
                barStyle={isDark ? 'light-content' : 'dark-content'} 
                translucent 
                backgroundColor="transparent"
            />
            <Stack.Screen options={{ headerShown: false }} />
            
            <ThemedView style={[styles.fixedHeader, { paddingTop: insets.top + Spacing.sm }]}>
                <View style={[styles.navRow, horizontalPadding]}>
                    <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                        <ThemedIcon name="chevron-left" size={26} />
                    </Pressable>
                    <View />
                    <Pressable onPress={() => router.push({ 
                        pathname: '/search/results', 
                        params: { context: 'providers', subcategory: subcategoryTitle, category: category } 
                    })} style={styles.iconBtn}>
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
                animationType="fade"
                onRequestClose={() => setActiveModalFilter(null)}
            >
                <Pressable 
                    style={styles.dropdownOverlay}
                    onPress={() => setActiveModalFilter(null)}
                >
                    <Pressable style={styles.dropdownWrapper}>
                        <BlurView 
                            intensity={isDark ? 80 : 100} 
                            tint={isDark ? "dark" : "light"}
                            style={[
                                styles.dropdownContainer, 
                                { 
                                    borderColor: theme.outlineVariant,
                                    backgroundColor: isDark ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.65)'
                                }
                            ]}
                        >
                            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                                {activeModalFilter?.filter_type === 'range' ? (
                                    <View style={{ paddingVertical: Spacing.xl }}>
                                        <ThemedText variant="bodyLarge" align="center">
                                            Price Range: ${activeModalFilter.filter_options.min} - ${activeModalFilter.filter_options.max}
                                        </ThemedText>
                                        <Pressable 
                                            style={{ 
                                                marginTop: Spacing.lg, 
                                                padding: Spacing.md, 
                                                backgroundColor: theme.primary, 
                                                borderRadius: BorderRadius.md, 
                                                alignItems: 'center' 
                                            }}
                                            onPress={() => {
                                                handleSelectOption(activeModalFilter.filter_label, `Under $${activeModalFilter.filter_options.default}`);
                                                setActiveModalFilter(null);
                                            }}
                                        >
                                            <ThemedText colorName="onPrimary" style={{ fontWeight: '700' }}>
                                                Apply Default (${activeModalFilter.filter_options.default})
                                            </ThemedText>
                                        </Pressable>
                                    </View>
                                ) : (
                                    Array.isArray(activeModalFilter?.filter_options) && activeModalFilter.filter_options.map((option: string, idx: number) => {
                                        const isSelected = activeFilters[activeModalFilter.filter_label]?.includes(option);
                                        const isMulti = activeModalFilter.filter_type === 'multi_select';
                                        return (
                                            <Pressable 
                                                key={idx}
                                                style={[styles.dropdownOption, { borderBottomColor: theme.outlineVariant }]}
                                                onPress={() => {
                                                    handleSelectOption(activeModalFilter.filter_label, option, isMulti);
                                                    if (!isMulti) {
                                                        setActiveModalFilter(null);
                                                    }
                                                }}
                                            >
                                                <ThemedText 
                                                    variant="bodyMedium" 
                                                    style={[isSelected && { fontWeight: '700', color: theme.primary }]}
                                                >
                                                    {option}
                                                </ThemedText>
                                                {isSelected && (
                                                    <ThemedIcon name="check" colorName="primary" size={20} />
                                                )}
                                            </Pressable>
                                        );
                                    })
                                )}
                            </ScrollView>
                        </BlurView>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScreenLayout>
    );
}

/**
 * Original Style Horizontal Provider Card
 */
function ProviderCard({ item, theme, isDark, subcategory, onPress }: { item: User, theme: any, isDark: boolean, subcategory: string, onPress: () => void }) {
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
                        
                        <View style={styles.providerInfoRow}>
                            <ThemedText variant="labelMedium" colorName="textMuted" style={styles.departmentText}>
                                {item.department || 'Expert'}
                            </ThemedText>
                            {item.username && (
                                <ThemedText variant="labelSmall" colorName="primary" style={styles.usernameText}>
                                    @{item.username}
                                </ThemedText>
                            )}
                        </View>

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
    providerInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    departmentText: {
        fontSize: 13,
    },
    usernameText: {
        fontWeight: '600',
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
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        paddingTop: 230,
    },
    dropdownWrapper: {
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    dropdownContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        maxHeight: 380,
    },
    dropdownHeader: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    dropdownScroll: {
        paddingHorizontal: Spacing.lg,
    },
    dropdownOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});
