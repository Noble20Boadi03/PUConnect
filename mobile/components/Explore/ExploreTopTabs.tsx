import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import type { ExploreTab } from '../../types/explore';

const TABS: { key: ExploreTab; label: string }[] = [
  { key: 'categories', label: 'Categories' },
  { key: 'people', label: 'People' },
];

export interface ExploreTopTabsProps {
  activeTab: ExploreTab;
  onTabChange: (tab: ExploreTab) => void;
  subtleBg: string;
  cardBg: string;
  textColor: string;
}

export const ExploreTopTabs: React.FC<ExploreTopTabsProps> = ({
  activeTab,
  onTabChange,
  subtleBg,
  cardBg,
  textColor,
}) => (
  <View style={[styles.wrap, { backgroundColor: subtleBg }]}>
    {TABS.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, isActive && { backgroundColor: cardBg }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTabChange(tab.key);
          }}
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: isActive ? textColor : textColor + '99' },
              isActive && styles.tabLabelActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
  },
  tabLabel: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});

export default ExploreTopTabs;
