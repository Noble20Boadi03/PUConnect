import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Spacing, Typography } from '../../constants';
import { formatExploreTagLabel } from '../../lib/formatExploreTagLabel';
import type { ExploreServiceTagFilter } from '../../types/explore';

export interface ExploreTagFilterPillsProps {
  tags: string[];
  activeFilter: ExploreServiceTagFilter;
  onFilterChange: (filter: ExploreServiceTagFilter) => void;
  textColor: string;
  primaryColor: string;
  borderColor: string;
}

export const ExploreTagFilterPills: React.FC<ExploreTagFilterPillsProps> = ({
  tags,
  activeFilter,
  onFilterChange,
  textColor,
  primaryColor,
  borderColor,
}) => {
  const isDark = useColorScheme() === 'dark';

  const pills = useMemo(
    () => [
      { key: 'all' as const, label: 'All' },
      ...tags.map((tag) => ({ key: tag, label: formatExploreTagLabel(tag) })),
    ],
    [tags]
  );

  const handlePress = useCallback(
    (filter: ExploreServiceTagFilter) => {
      
      onFilterChange(filter);
    },
    [onFilterChange]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {pills.map((pill) => {
        const isActive = activeFilter === pill.key;
        return (
          <TouchableOpacity
            key={pill.key}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? primaryColor : 'transparent',
                borderColor: isActive ? primaryColor : borderColor,
              },
            ]}
            onPress={() => handlePress(pill.key)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: isActive ? (isDark ? '#09090B' : '#FFFFFF') : textColor,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {pill.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.size.xs,
  },
});

export default ExploreTagFilterPills;
