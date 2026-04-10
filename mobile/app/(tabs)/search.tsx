import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { router } from 'expo-router';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { useResponsive } from '@/hooks/use-responsive';

export default function SearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { spacingMultiplier } = useResponsive();
  const [activeTab, setActiveTab] = useState<'categories' | 'interests'>('categories');

  const horizontalPadding = Spacing.xl * spacingMultiplier;

  return (
    <ScreenLayout padding="none" withSafeArea={false}>
      {/* Fixed Header & Tabs */}
      <ThemedView elevation={1} style={{ zIndex: 10 }}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, paddingHorizontal: horizontalPadding }]}>
          <ThemedText variant="headlineSmall" style={styles.headerTitle}>Categories</ThemedText>
          <Pressable style={styles.iconBtn}>
            <ThemedIcon name="magnify" size={24} />
          </Pressable>
        </View>

        <View style={[styles.tabBar, { paddingHorizontal: horizontalPadding }]}>
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
          { paddingBottom: insets.bottom + Spacing.massive }
        ]}
      >
        {activeTab === 'categories' ? (
          CAMPUS_CATEGORIES.map((cat) => (
            <Pressable 
              key={cat.id} 
              style={[styles.categoryItem, { borderBottomColor: theme.outlineVariant, paddingHorizontal: horizontalPadding }]} 
              onPress={() => router.push(`/search/${cat.id}`)}
            >
              <ThemedView colorName="surfaceVariant" style={styles.iconContainer}>
                <ThemedIcon name={cat.icon as any} size={32} colorName="primary" />
              </ThemedView>
              <View style={styles.textContainer}>
                <ThemedText variant="titleMedium">{cat.title}</ThemedText>
                <ThemedText variant="bodySmall" colorName="textMuted">{cat.subtitle}</ThemedText>
              </View>
              <ThemedIcon name="chevron-right" size={20} colorName="outline" />
            </Pressable>
          ))
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginRight: Spacing.lg,
  },
  activeTabText: {
    fontWeight: '800',
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
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


