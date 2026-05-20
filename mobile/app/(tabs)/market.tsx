import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';

type FilterOption = 'all' | 'services' | 'requests';

export default function MarketScreen() {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const searchBg = isDark ? '#1E1E21' : '#F0F0F2';

  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'services', label: 'Services' },
    { key: 'requests', label: 'Requests' },
  ];

  const handleFilterPress = (filter: FilterOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      {/* Top Header Section */}
      <View style={[styles.headerContainer, { backgroundColor: cardBg }]}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text style={[styles.appTitle, { color: Colors.text }]}>PuConnect</Text>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: searchBg }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: searchBg }]}>
          <Ionicons name="search-outline" size={18} color={Colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors.text }]}
            placeholder="Search Services or Requests"
            placeholderTextColor={Colors.icon + '90'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.icon} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <View style={styles.filterPills}>
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isActive ? Colors.primary : 'transparent',
                      borderColor: isActive ? Colors.primary : Colors.border,
                    },
                  ]}
                  onPress={() => handleFilterPress(filter.key)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color: isActive
                          ? (isDark ? '#09090B' : '#FFFFFF')
                          : Colors.text,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tip Banner */}
        <View style={[styles.tipContainer, { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '30' }]}>
          <Ionicons name="bulb-outline" size={16} color={Colors.primary} style={{ marginTop: 1 }} />
          <Text style={[styles.tipText, { color: Colors.text + 'BB' }]}>
            Browse Services for professional help or Requests from students who need your skills.
          </Text>
        </View>
      </View>

      {/* Middle Content Area (Blank - for future scrollable content) */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyContentPlaceholder} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  appTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.sm + 4,
    height: 44,
    marginBottom: Spacing.sm + 4,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 4,
  },
  filterPills: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: Typography.size.xs,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs + 2,
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.sm + 2,
  },
  tipText: {
    fontSize: Typography.size.xs,
    lineHeight: 17,
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  emptyContentPlaceholder: {
    flex: 1,
  },
});
