import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Dimensions, ImageBackground } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
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
  const { token, user } = useAuth();
  const insets = useSafeAreaInsets();
  const { contentPaddingLeft, contentPaddingRight } = useResponsive();
  const tabBarHeight = useTabBarHeight();
  const [activeTab, setActiveTab] = useState<'categories' | 'interests'>('categories');

  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };
  const gridCardWidth = (Dimensions.get('window').width - (contentPaddingLeft + contentPaddingRight) - Spacing.md) / 2;

  const isAdmin = user?.role === 'admin';

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
              onPress={() => (token ? router.push('/notifications') : router.push('/login'))}
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
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[
          styles.listContent, 
          { paddingBottom: tabBarHeight }
        ]}
      >
        {activeTab === 'categories' ? (
          <View style={[styles.grid, horizontalPadding]}>
            {CAMPUS_CATEGORIES.map((cat) => (
              <ThemedView 
                key={cat.id} 
                elevation={2}
                style={[styles.categoryCard, { width: gridCardWidth }]}
              >
                <Pressable 
                  style={({ pressed }) => [styles.cardPressable, pressed && { opacity: 0.95 }]}
                  onPress={() => router.push({
                    pathname: "/search/[id]",
                    params: { id: cat.id }
                  })}
                >
                  <ImageBackground 
                    source={{ uri: cat.image }} 
                    style={styles.cardImage}
                    imageStyle={styles.cardImageInner}
                  >
                    <View style={styles.cardOverlay}>
                        <ThemedText variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
                          {cat.title}
                        </ThemedText>
                        <ThemedText variant="labelSmall" style={styles.cardSubtitle} numberOfLines={1}>
                          {cat.subtitle}
                        </ThemedText>
                    </View>
                  </ImageBackground>
                </Pressable>
              </ThemedView>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
             <ThemedIcon name="creation" size={48} colorName="outline" />
             <ThemedText variant="bodyLarge" colorName="textSecondary" align="center" style={styles.emptyText}>
               Your personalized interests will appear here.
             </ThemedText>
          </View>
        )}
      </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  categoryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
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
  cardImageInner: {
    borderRadius: 24,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.huge,
  }
});


