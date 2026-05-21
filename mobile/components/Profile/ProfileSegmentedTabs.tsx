import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import type { ProviderPostsTab } from '../../types';

const TABS: { key: ProviderPostsTab; label: string }[] = [
  { key: 'services', label: 'Services' },
  { key: 'requests', label: 'Requests' },
];

export interface ProfileSegmentedTabsProps {
  activeTab: ProviderPostsTab;
  onTabChange: (tab: ProviderPostsTab) => void;
  subtleBg: string;
  cardBg: string;
  textColor: string;
}

export const ProfileSegmentedTabs: React.FC<ProfileSegmentedTabsProps> = ({
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

export default ProfileSegmentedTabs;
