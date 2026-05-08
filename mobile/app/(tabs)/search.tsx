import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { CAMPUS_CATEGORIES, DetailedCategory } from '@/constants/categories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useResponsive } from '@/hooks/use-responsive';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useAuth } from '@/context/auth-context';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { contentPaddingLeft, contentPaddingRight } = useResponsive();
  const tabBarHeight = useTabBarHeight();
  const [activeTab, setActiveTab] = useState<'categories' | 'interests'>('categories');

  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };
  const gridCardWidth = (Dimensions.get('window').width - (contentPaddingLeft + contentPaddingRight) - Spacing.md) / 2;

  const isAdmin = user?.role === 'admin';

  const handleCategoryPress = useCallback((catId: string) => {
    router.push({
      pathname: "/search/[id]",
      params: { id: catId }
    });
  }, []);

  const renderCategoryItem = useCallback(({ item: cat }: { item: DetailedCategory }) => (
    <ThemedView 
      elevation={2}
      style={[styles.categoryCard, { width: gridCardWidth }]}
    >
      <Pressable 
        style={({ pressed }) => [styles.cardPressable, pressed && { opacity: 0.95 }]}
        onPress={() => handleCategoryPress(cat.id)}
      >
        <Image 
          source={cat.image} 
          style={styles.cardImage}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
        <View style={[StyleSheet.absoluteFill, styles.cardOverlay]}>
          <ThemedText variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
            {cat.title}
          </ThemedText>
          <ThemedText variant="labelSmall" style={styles.cardSubtitle} numberOfLines={1}>
            {cat.subtitle}
          </ThemedText>
        </View>
      </Pressable>
    </ThemedView>
  ), [gridCardWidth, handleCategoryPress]);

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      {/* Fixed Header & Tabs */}
      <ThemedView elevation={1} style={{ zIndex: 10 }}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
          <ThemedText variant="headlineSmall" style={styles.headerTitle}>Explore</ThemedText>
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
              onPress={() => router.push('/notifications')}
            >
              <ThemedIcon name="bell-outline" size={24} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.tabBar, horizontalPadding]}>
          <Pressable 
            onPress={() => setActiveTab('categories')}
            style={[styles.tab, activeTab === 'categories' && { borderBottomWidth: 3, borderBottomColor: theme.primary }]}
          >
            <ThemedText 
              variant="titleSmall"
              colorName={activeTab === 'categories' ? 'text' : 'textMuted'}
              style={activeTab === 'categories' && styles.activeTabText}
            >
              Categories
            </ThemedText>
          </Pressable>
          <Pressable 
            onPress={() => setActiveTab('interests')}
            style={[styles.tab, activeTab === 'interests' && { borderBottomWidth: 3, borderBottomColor: theme.primary }]}
          >
            <ThemedText 
              variant="titleSmall"
              colorName={activeTab === 'interests' ? 'text' : 'textMuted'}
              style={activeTab === 'interests' && styles.activeTabText}
            >
              Interests
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* List */}
      {activeTab === 'categories' ? (
        <FlatList
          data={CAMPUS_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent, 
            { paddingBottom: tabBarHeight + Spacing.xl, paddingHorizontal: contentPaddingLeft }
          ]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={6}
          windowSize={3}
        />
      ) : (
        <View style={styles.emptyContainer}>
           <ThemedIcon name="creation" size={48} colorName="outline" />
           <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={styles.emptyText}>
             Your personalized interests will appear here.
           </ThemedText>
        </View>
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
  headerTitle: {
    fontWeight: '800',
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  tab: {
    flex: 1, // Equally fit the screen
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  activeTabText: {
    fontWeight: '800',
  },
  listContent: {
    paddingVertical: Spacing.lg,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  categoryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#2c3e50', // Fallback for missing images
  },
  cardPressable: {
    height: 180,
  },
  cardImage: {
    flex: 1,
  },
  cardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyText: {
    marginTop: Spacing.md,
    lineHeight: 24,
  }
});


