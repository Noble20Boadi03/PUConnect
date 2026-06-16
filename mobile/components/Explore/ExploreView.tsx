import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useColorScheme,
  TextInput,
  TouchableOpacity,
  Animated,
  Text as RNText,
  RefreshControlProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';

import { useAppRouter, useThemeColor } from '../../hooks';
import { useAuthStore } from '../../store';
import { buildExploreCategoryHref, buildProviderProfileHref } from '../../lib';

import { ExploreHeader } from './ExploreHeader';
import { ExploreTopTabs } from './ExploreTopTabs';
import { ExploreCategoriesPanel } from './ExploreCategoriesPanel';
import { ExplorePeoplePanel } from './ExplorePeoplePanel';
import type {
  ExploreCategory,
  ExploreCategoryFilter,
  ExploreProvider,
  ExploreTab,
} from '../../types/explore';

export interface ExploreViewProps {
  categories?: ExploreCategory[];
  providers?: ExploreProvider[];
  onCategoryPress?: (category: ExploreCategory) => void;
  onProviderPress?: (provider: ExploreProvider) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  categories = [],
  providers = [],
  onCategoryPress,
  onProviderPress,
  refreshControl,
}) => {
  const router = useAppRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const borderColor = isDark ? '#30363D' : 'rgba(0, 0, 0, 0.08)';

  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<ExploreTab>('categories');
  const [peopleFilter, setPeopleFilter] = useState<ExploreCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleCategoryPress = useCallback(
    (category: ExploreCategory) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onCategoryPress) {
        onCategoryPress(category);
        return;
      }
      router.pushStack(buildExploreCategoryHref(category.id));
    },
    [onCategoryPress, router]
  );

  const handleProviderPress = useCallback(
    (provider: ExploreProvider) => {
      if (onProviderPress) {
        onProviderPress(provider);
        return;
      }
      
      if (currentUser?.username === provider.username) {
        router.push('/(tabs)/profile' as any);
      } else {
        router.push(buildProviderProfileHref(provider.username) as any);
      }
    },
    [onProviderPress, router, currentUser]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSearchPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchExpanded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      searchInputRef.current?.focus();
    });
  }, [fadeAnim]);

  const handleSearchClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setSearchQuery('');
      setIsSearchExpanded(false);
    });
  }, [fadeAnim]);

  const tabTheme = useMemo(
    () => ({
      subtleBg,
      cardBg,
      textColor: Colors.text,
    }),
    [subtleBg, cardBg, Colors.text]
  );

  const peopleTheme = useMemo(
    () => ({
      cardBg,
      textColor: Colors.text,
      mutedColor: Colors.icon,
      primaryColor: Colors.primary,
      borderColor,
      subtleBg,
    }),
    [cardBg, Colors.text, Colors.icon, Colors.primary, borderColor, subtleBg]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <ExploreHeader 
          textColor={Colors.text} 
          buttonBg={cardBg}
          onSearchPress={isSearchExpanded ? undefined : handleSearchPress}
          hideSearchIcon={isSearchExpanded}
        />

        <View style={styles.topSection}>
          {!isSearchExpanded ? (
            <ExploreTopTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              {...tabTheme}
            />
          ) : (
            <Animated.View style={[styles.searchBarContainer, { opacity: fadeAnim, backgroundColor: subtleBg }]}>
              <View style={[styles.searchInner, { backgroundColor: cardBg }]}>
                <Ionicons name="search-outline" size={20} color={Colors.icon} />
                <TextInput
                  ref={searchInputRef}
                  style={[styles.searchInput, { color: Colors.text }]}
                  placeholder="Search providers, services..."
                  placeholderTextColor={Colors.icon}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  autoCapitalize="none"
                  returnKeyType="search"
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={Colors.icon} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={handleSearchClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <RNText style={[styles.cancelText, { color: Colors.primary }]}>Cancel</RNText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <View style={styles.panel}>
          {isSearchExpanded || activeTab === 'people' ? (
            <ExplorePeoplePanel
              categories={categories}
              providers={providers}
              activeFilter={peopleFilter}
              onFilterChange={setPeopleFilter}
              onProviderPress={handleProviderPress}
              searchQuery={searchQuery}
              refreshControl={undefined}
              {...peopleTheme}
            />
          ) : (
            <ExploreCategoriesPanel
              categories={categories}
              onCategoryPress={handleCategoryPress}
              refreshControl={undefined}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  topSection: {
    marginBottom: Spacing.md,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  searchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.sm + 4,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    height: '100%',
  },
  cancelText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  panel: {
    flex: 1,
  },
});

export default ExploreView;
