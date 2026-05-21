import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing } from '../../constants';
import { FEATURED_POSTS_MOCK } from '../../constants';
import { MarketHeader, MarketFeedHeader, FeaturedPostCard } from '../../components';

/**
 * Market uses a single ScrollView (mock data is small) to avoid nested
 * VirtualizedLists, which cause slow updates and jank after resume.
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.root}>
        <MarketHeader {...headerTheme} />

        <ScrollView
          style={[styles.scroll, { backgroundColor: screenBg }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          overScrollMode="never"
          removeClippedSubviews
        >
          <MarketFeedHeader {...feedHeaderTheme} />

          {FEATURED_POSTS_MOCK.map((item) => (
            <View key={item.id} style={styles.featuredItem}>
              <FeaturedPostCard
                item={item}
                layout="stack"
                onPress={handleCardPress}
                {...postCardTheme}
              />
            </View>
          ))}
        </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  featuredItem: {
    paddingHorizontal: Spacing.lg,
  },
});
