import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { router } from 'expo-router';

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    title: 'Market to local audiences',
    subtitle: 'Local SEO, Create authentic UGC videos',
    icon: 'storefront-outline',
  },
  {
    id: '2',
    title: 'Research a business landscape',
    subtitle: 'Virtual Assistant, Domain Name Research',
    icon: 'analytics-outline',
  },
  {
    id: '3',
    title: 'Create memorable brand assets',
    subtitle: 'Logo Design, Branding, Visual Identity',
    icon: 'diamond-outline',
  },
  {
    id: '4',
    title: 'Design a new product',
    subtitle: 'Industrial & Product Design, 3D Product Animation',
    icon: 'cube-outline',
  },
  {
    id: '5',
    title: 'Manage data',
    subtitle: 'Data Entry, Data Processing',
    icon: 'settings-outline',
  },
  {
    id: '6',
    title: 'Focus on personal growth',
    subtitle: 'Life Coaching, Career Consulting',
    icon: 'accessibility-outline',
  },
  {
    id: '7',
    title: 'Get creative with arts and crafts',
    subtitle: 'Digital Illustration, Art & Fashion',
    icon: 'brush-outline',
  },
  {
    id: '8',
    title: 'Analyze business data',
    subtitle: 'Web Analytics, Data Visualization',
    icon: 'stats-chart-outline',
  },
];

export default function SearchScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'categories' | 'interests'>('categories');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Categories</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="search-outline" size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        <Pressable 
          onPress={() => setActiveTab('categories')}
          style={[styles.tab, activeTab === 'categories' && { borderBottomWidth: 2, borderBottomColor: theme.text }]}
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
          style={[styles.tab, activeTab === 'interests' && { borderBottomWidth: 2, borderBottomColor: theme.text }]}
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
        {CATEGORIES.map((cat) => (
          <Pressable key={cat.id} style={styles.categoryItem} onPress={() => {}}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1e293b' : '#f8fafc' }]}>
              <Ionicons name={cat.icon} size={24} color={theme.textSecondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>{cat.title}</Text>
              <Text style={[styles.categorySubtitle, { color: theme.textMuted }]}>{cat.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 20,
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
    paddingVertical: 18,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  categorySubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
});
