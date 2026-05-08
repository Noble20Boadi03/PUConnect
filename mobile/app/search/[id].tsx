import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Image, ScrollView, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';

const IMAGE_HEIGHT = 300;

export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { contentPaddingLeft, contentPaddingRight } = useResponsive();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };
    
    const category = CAMPUS_CATEGORIES.find(c => c.id === id);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    const THRESHOLD = IMAGE_HEIGHT - (insets.top + 50);

    if (!category) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Category not found</ThemedText>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <ThemedText colorName="primary">Go Back</ThemedText>
                </Pressable>
            </ThemedView>
        );
    }

    const handleScroll = (e: any) => {
        const scrollY = e.nativeEvent.contentOffset.y;
        if (scrollY > THRESHOLD && !isHeaderScrolled) {
            setIsHeaderScrolled(true);
        } else if (scrollY <= THRESHOLD && isHeaderScrolled) {
            setIsHeaderScrolled(false);
        }
    };

    const getSubCategoryIcon = (title: string): string => {
        const t = title.toLowerCase();
        if (t.includes('web') || t.includes('app') || t.includes('coding') || t.includes('software')) return 'code-tags';
        if (t.includes('design') || t.includes('graphic') || t.includes('illustration')) return 'palette-outline';
        if (t.includes('photo') || t.includes('video') || t.includes('camera')) return 'camera-outline';
        if (t.includes('music') || t.includes('audio') || t.includes('mixing') || t.includes('worship')) return 'music-note-outline';
        if (t.includes('cv') || t.includes('job') || t.includes('career') || t.includes('interview')) return 'briefcase-outline';
        if (t.includes('startup') || t.includes('business') || t.includes('market')) return 'trending-up';
        if (t.includes('delivery') || t.includes('logistics') || t.includes('campus')) return 'truck-delivery-outline';
        if (t.includes('church') || t.includes('ministry') || t.includes('sermon')) return 'hands-pray';
        if (t.includes('tutoring') || t.includes('academic') || t.includes('subject')) return 'school-outline';
        if (t.includes('it support') || t.includes('troubleshoot')) return 'tools';
        if (t.includes('data') || t.includes('analysis') || t.includes('power bi')) return 'chart-bar';
        if (t.includes('stream')) return 'broadcast';
        return 'star-four-points-outline';
    };

    /**
     * CATEGORY SPECIFIC PALETTES
     * High-vibrancy solid colors for the cards, tailored per category
     */
    const CATEGORY_PALETTES: Record<string, string[]> = {
        'academics': ['#1565C0', '#00695C', '#6A1B9A'], // Blue, Dark Teal, Purple
        'tech_design': ['#455A64', '#C62828', '#EF6C00'], // Slate, Red, Orange
        'media_music': ['#00838F', '#303F9F', '#2E7D32'], // Teal, Blue, Green (Original screenshot)
        'biz_career': ['#303F9F', '#AD1457', '#1565C0'], // Blue, Pink, Bright Blue
        'campus_life': ['#2E7D32', '#EF6C00', '#C62828'], // Green, Orange, Red
    };

    const FALLBACK_PALETTE = ['#00838F', '#303F9F', '#2E7D32', '#C62828'];

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <StatusBar 
                barStyle={isHeaderScrolled ? (isDark ? 'light-content' : 'dark-content') : 'light-content'} 
                translucent 
                backgroundColor="transparent"
            />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Fixed Background Image */}
            <View style={styles.imageBackground}>
                <Image
                    source={{ uri: category.image }}
                    style={styles.mainImage}
                    resizeMode="cover"
                />
                <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
            </View>

            {/* Floating Navigation */}
            <View style={[styles.floatingNav, { top: insets.top + Spacing.sm, paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight }]}>
                <Pressable onPress={() => router.back()} style={styles.navBtn}>
                    <ThemedIcon name="chevron-left" size={26} lightColor="#fff" darkColor="#fff" />
                </Pressable>
                
                <Pressable onPress={() => router.push({ pathname: '/search/results', params: { q: '' } })} style={styles.navBtn}>
                    <ThemedIcon name="magnify" size={24} lightColor="#fff" darkColor="#fff" />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View style={styles.imageSpacer} />

                <ThemedView colorName="background" style={styles.contentCard}>
                    {/* Hero Info */}
                    <View style={[styles.heroTextContent, horizontalPadding]}>
                        <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                             <ThemedIcon name={category.icon as any} size={40} colorName="primary" />
                        </View>
                        <ThemedText variant="headlineLarge" style={styles.title}>{category.title}</ThemedText>
                        <ThemedText variant="bodyLarge" colorName="textMuted" style={styles.tagline}>{category.tagline}</ThemedText>
                    </View>

                    {/* Simple Solid Colored discovery list */}
                    <View style={[styles.listContainer, { paddingHorizontal: contentPaddingLeft }]}>
                        {category.groups.flatMap(g => g.items).map((item, index) => {
                            const activePalette = CATEGORY_PALETTES[category.id] || FALLBACK_PALETTE;
                            const backgroundColor = activePalette[index % activePalette.length];
                            return (
                                <Pressable 
                                    key={index}
                                    style={[styles.solidCard, { backgroundColor }]}
                                    onPress={() => router.push({
                                        pathname: '/search/listings/[subcategory]',
                                        params: { 
                                            subcategory: item.title,
                                            category: category.title,
                                            description: item.description 
                                        }
                                    })}
                                >
                                    <View style={[styles.cardIconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                                        <ThemedIcon 
                                            name={getSubCategoryIcon(item.title) as any} 
                                            size={24} 
                                            lightColor="#fff"
                                            darkColor="#fff"
                                        />
                                    </View>
                                    
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <ThemedText variant="titleMedium" style={styles.cardTitle}>
                                                {item.title}
                                            </ThemedText>
                                            {item.isNew && (
                                                <View style={[styles.newBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                                                    <ThemedText variant="labelSmall" style={{ color: '#fff', fontWeight: '800' }}>NEW</ThemedText>
                                                </View>
                                            )}
                                        </View>
                                        
                                        {item.description && (
                                            <ThemedText variant="labelSmall" numberOfLines={2} style={styles.cardDescription}>
                                                {item.description}
                                            </ThemedText>
                                        )}
                                    </View>

                                    <ThemedIcon name="chevron-right" size={20} lightColor="#fff" darkColor="#fff" style={{ opacity: 0.7 }} />
                                </Pressable>
                            );
                        })}
                    </View>
                </ThemedView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: IMAGE_HEIGHT,
        zIndex: 0,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    floatingNav: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 100,
    },
    navBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        ...Shadows.level2,
    },
    imageSpacer: {
        height: IMAGE_HEIGHT - 30,
    },
    contentCard: {
        borderTopLeftRadius: BorderRadius.xxl,
        borderTopRightRadius: BorderRadius.xxl,
        paddingTop: Spacing.xl,
        minHeight: Dimensions.get('window').height - (IMAGE_HEIGHT - 30),
    },
    heroTextContent: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconBox: {
        width: 72,
        height: 72,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
    },
    tagline: {
        fontSize: 15,
        fontStyle: 'italic',
        marginTop: 4,
        textAlign: 'center',
    },
    listContainer: {
        gap: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    solidCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: 24,
        gap: Spacing.md,
        ...Shadows.level2,
    },
    cardIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    cardDescription: {
        marginTop: 4,
        lineHeight: 16,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
    },
    newBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
});
