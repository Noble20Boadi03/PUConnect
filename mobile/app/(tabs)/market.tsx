import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ListRenderItem,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing } from '../../constants';
import { FEATURED_POSTS_MOCK } from '../../constants';
import { MarketHeader, MarketFeedHeader, FeaturedPostCard } from '../../components';
import type { FeaturedPost } from '../../types';

/**
 * Market feed uses a single vertical FlatList (not ScrollView) so scrolling stays smooth.
 * Horizontal rows live in ListHeaderComponent with nested horizontal FlatLists.
 * @see https://reactnative.dev/docs/optimizing-flatlist-configuration
 */
export default function MarketScreen() {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const searchBg = isDark ? '#1E1E21' : '#F0F0F2';
  const borderColor = isDark ? '#30363D' : 'rgba(0, 0, 0, 0.08)';

  const [showMarketTip, setShowMarketTip] = useState(true);

  const dismissTip = useCallback(() => {
    setShowMarketTip(false);
  }, []);

  const handleCardPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const headerTheme = useMemo(
    () => ({
      textColor: Colors.text,
      iconColor: Colors.icon,
      primaryColor: Colors.primary,
      borderColor: Colors.border,
      cardBg,
      searchBg,
      showTip: showMarketTip,
      onDismissTip: dismissTip,
    }),
    [
      Colors.text,
      Colors.icon,
      Colors.primary,
      Colors.border,
      cardBg,
      searchBg,
      showMarketTip,
      dismissTip,
    ]
  );

  const feedHeaderTheme = useMemo(
    () => ({
      cardBg,
      searchBg,
      textColor: Colors.text,
      iconColor: Colors.icon,
      primaryColor: Colors.primary,
    }),
    [cardBg, searchBg, Colors.text, Colors.icon, Colors.primary]
  );

  const postCardTheme = useMemo(
    () => ({
      cardBg,
      subtleBg: searchBg,
      textColor: Colors.text,
      mutedColor: Colors.icon,
      primaryColor: Colors.primary,
      borderColor,
    }),
    [cardBg, searchBg, Colors.text, Colors.icon, Colors.primary, borderColor]
  );

  const ListHeader = useMemo(
    () => <MarketFeedHeader {...feedHeaderTheme} />,
    [feedHeaderTheme]
  );

  const renderFeatured: ListRenderItem<FeaturedPost> = useCallback(
    ({ item }) => (
      <View style={styles.featuredItem}>
        <FeaturedPostCard
          item={item}
          layout="stack"
          onPress={handleCardPress}
          {...postCardTheme}
        />
      </View>
    ),
    [handleCardPress, postCardTheme]
  );

  const keyExtractor = useCallback((item: FeaturedPost) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.root}>
        <MarketHeader {...headerTheme} />

        <FlatList
          data={FEATURED_POSTS_MOCK}
          renderItem={renderFeatured}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          style={[styles.list, { backgroundColor: screenBg }]}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          overScrollMode="never"
          removeClippedSubviews
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={5}
          updateCellsBatchingPeriod={50}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  featuredItem: {
    paddingHorizontal: Spacing.lg,
  },
});
