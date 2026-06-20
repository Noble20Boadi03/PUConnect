import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import { getSafeAreaBottom, getScreenTopPadding } from '../../lib/safeAreaInsets';
import { GuardedPressable } from '../GuardedPressable';
import { CategoryDetailHero } from './CategoryDetailHero';
import { CategoryDetailServiceRow } from './CategoryDetailServiceRow';
import type { ExploreCategory, ExploreCategoryService } from '../../types/explore';

export interface CategoryDetailViewProps {
  category: ExploreCategory;
  services: ExploreCategoryService[];
  onBack: () => void;
  onServicePress?: (service: ExploreCategoryService) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  services,
  onBack,
  onServicePress,
}) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const borderColor = isDark ? '#30363D' : 'rgba(0, 0, 0, 0.08)';
  const insets = useSafeAreaInsets();
  const topPadding = getScreenTopPadding(insets.top);

  const handleServicePress = useCallback(
    (service: ExploreCategoryService) => {
      
      onServicePress?.(service);
    },
    [onServicePress]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: screenBg,
          paddingTop: topPadding,
          paddingBottom: getSafeAreaBottom(insets.bottom),
        },
      ]}
    >
      <View style={styles.header}>
        <GuardedPressable
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={() => {
            
            onBack();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </GuardedPressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor }]}>
          <CategoryDetailHero iconName={category.iconName} accentColor={category.accentColor} />
          <View style={styles.heroText}>
            <Text style={[styles.categoryTitle, { color: Colors.text }]}>
              {category.title}
            </Text>
            <Text style={[styles.tagline, { color: Colors.icon }]}>{category.tagline}</Text>
          </View>
          <Image
            source={{ uri: category.imageUrl }}
            style={styles.heroThumb}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={`category-detail-${category.id}`}
            transition={0}
          />
        </View>

        <Text style={[styles.description, { color: Colors.icon }]}>{category.description}</Text>

        <Text style={[styles.sectionLabel, { color: Colors.text }]}>Services</Text>

        <View style={styles.serviceList}>
          {services.map((service) => (
            <CategoryDetailServiceRow
              key={service.id}
              service={service}
              accentColor={category.accentColor}
              cardBg={cardBg}
              borderColor={borderColor}
              textColor={Colors.text}
              mutedColor={Colors.icon}
              onPress={onServicePress ? handleServicePress : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  heroThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    transform: [{ rotate: '8deg' }],
  },
  categoryTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 24,
  },
  tagline: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 19,
  },
  description: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 21,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.size.md,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: Spacing.md,
  },
  serviceList: {
    gap: Spacing.sm + 2,
  },
});

export default CategoryDetailView;
