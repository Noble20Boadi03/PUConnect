import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';
import { router } from 'expo-router';
import { CAMPUS_CATEGORIES } from '@/constants/categories';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'categories' | 'interests'>('categories');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Categories</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="search-outline" size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        <Pressable 
          onPress={() => setActiveTab('categories')}
          style={[styles.tab, activeTab === 'categories' && { borderBottomWidth: 3, borderBottomColor: (theme as any).discoveryPrimary }]}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'categories' ? theme.text : theme.textMuted },
            activeTab === 'categories' && styles.activeTabText
          ]}>
            Categories
          </Text>
        </Pressable>
        <Pressable 
          onPress={() => setActiveTab('interests')}
          style={[styles.tab, activeTab === 'interests' && { borderBottomWidth: 3, borderBottomColor: (theme as any).discoveryPrimary }]}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'interests' ? theme.text : theme.textMuted },
            activeTab === 'interests' && styles.activeTabText
          ]}>
            Interests
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {activeTab === 'categories' ? (
          CAMPUS_CATEGORIES.map((cat) => (
            <Pressable 
              key={cat.id} 
              style={[styles.categoryItem, { borderBottomColor: theme.border }]} 
              onPress={() => router.push(`/search/${cat.id}`)}
              android_ripple={{ color: theme.border }}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={cat.icon as any} size={32} color={theme.textSecondary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.categoryTitle, { color: theme.text }]}>{cat.title}</Text>
                <Text style={[styles.categorySubtitle, { color: theme.textMuted }]}>{cat.subtitle}</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyContainer}>
             <Ionicons name="sparkles-outline" size={48} color={theme.textMuted} />
             <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Your personalized interests will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 20,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '800',
  },
  listContent: {
    paddingVertical: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categorySubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  }
});
