import { StyleSheet, View, Pressable, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useResponsive } from '@/hooks/use-responsive';

export default function CategoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { contentPaddingLeft, contentPaddingRight } = useResponsive();
    const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };
    const category = CAMPUS_CATEGORIES.find(c => c.id === id);

    if (!category) {
        return (
            <ScreenLayout>
                <View style={styles.centered}>
                    <ThemedText>Category not found</ThemedText>
                    <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <ThemedText colorName="primary">Go Back</ThemedText>
                    </Pressable>
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout scrollable padding="none" withSafeArea={false}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, ...horizontalPadding }]}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <ThemedIcon name="chevron-left" size={24} />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                    <ThemedIcon name="magnify" size={24} />
                </Pressable>
            </View>

            {/* Hero section */}
            <ImageBackground 
                source={{ uri: category.image }} 
                style={styles.heroSection}
            >
                <View style={styles.heroOverlay}>
                    <View style={styles.heroContent}>
                        <ThemedIcon name={category.icon as any} size={60} lightColor="#fff" darkColor="#fff" />
                        <ThemedText variant="headlineLarge" style={styles.title}>{category.title}</ThemedText>
                        <ThemedText variant="bodyLarge" style={styles.tagline}>{category.tagline}</ThemedText>
                    </View>
                </View>
            </ImageBackground>

            {/* Subcategories */}
            <View style={{ paddingBottom: insets.bottom + Spacing.xl }}>
                {category.groups.map((group, groupIdx) => (
                    <View key={groupIdx} style={styles.groupContainer}>
                        <ThemedText variant="labelLarge" colorName="textMuted" style={[styles.groupHeader, horizontalPadding]}>{group.header}</ThemedText>
                        {group.items.map((item, itemIdx) => (
                            <Pressable 
                                key={itemIdx} 
                                style={[styles.itemRow, { borderBottomColor: theme.outlineVariant, ...horizontalPadding }]}
                                onPress={() => router.push({
                                    pathname: '/search/listings/[subcategory]',
                                    params: { 
                                        subcategory: item.title,
                                        category: category.title,
                                        description: item.description 
                                    }
                                })}
                            >
                                <View style={styles.itemTitleContainer}>
                                    <ThemedText variant="titleMedium" style={styles.itemTitle}>{item.title}</ThemedText>
                                    {item.isNew && (
                                        <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
                                            <ThemedText variant="labelSmall" lightColor="#fff" darkColor="#fff">NEW</ThemedText>
                                        </View>
                                    )}
                                </View>
                                <ThemedIcon name="chevron-right" size={20} colorName="textMuted" />
                            </Pressable>
                        ))}
                    </View>
                ))}
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
    },
    iconBtn: {
        padding: 8,
    },
    heroSection: {
        height: 300,
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    heroContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginTop: 16,
        textAlign: 'center',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    tagline: {
        fontSize: 16,
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.9)',
    },
    groupContainer: {
        marginTop: 16,
    },
    groupHeader: {
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: Spacing.lg,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
    },
    itemTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    itemTitle: {
        fontSize: 17,
        fontWeight: '500',
    },
    newBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});
