import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { EXPLORE_CATEGORIES_MOCK, EXPLORE_PROVIDERS_MOCK } from '../../constants/exploreMock';
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
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  categories = EXPLORE_CATEGORIES_MOCK,
  providers = EXPLORE_PROVIDERS_MOCK,
  onCategoryPress,
  onProviderPress,
}) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const borderColor = isDark ? '#30363D' : 'rgba(0, 0, 0, 0.08)';

  const [activeTab, setActiveTab] = useState<ExploreTab>('categories');
  const [peopleFilter, setPeopleFilter] = useState<ExploreCategoryFilter>('all');

  const handleCategoryPress = useCallback(
    (category: ExploreCategory) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onCategoryPress?.(category);
    },
    [onCategoryPress]
  );

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
      subtleBg,
      textColor: Colors.text,
      mutedColor: Colors.icon,
      primaryColor: Colors.primary,
      borderColor,
    }),
    [cardBg, subtleBg, Colors.text, Colors.icon, Colors.primary, borderColor]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <ExploreHeader textColor={Colors.text} buttonBg={cardBg} />

      <ExploreTopTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        {...tabTheme}
      />

      <View style={styles.panel}>
        {activeTab === 'categories' ? (
          <ExploreCategoriesPanel
            categories={categories}
            cardBg={cardBg}
            textColor={Colors.text}
            mutedColor={Colors.icon}
            onCategoryPress={onCategoryPress ? handleCategoryPress : undefined}
          />
        ) : (
          <ExplorePeoplePanel
            categories={categories}
            providers={providers}
            activeFilter={peopleFilter}
            onFilterChange={setPeopleFilter}
            onProviderPress={onProviderPress}
            {...peopleTheme}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  panel: {
    flex: 1,
  },
});

export default ExploreView;
