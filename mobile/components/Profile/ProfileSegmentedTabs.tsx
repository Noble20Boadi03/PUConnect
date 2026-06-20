import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
  /** When false, Services tab is shown dimmed (user can still open it to see provider setup). */
  servicesEnabled?: boolean;
}

export const ProfileSegmentedTabs: React.FC<ProfileSegmentedTabsProps> = ({
  activeTab,
  onTabChange,
  subtleBg,
  cardBg,
  textColor,
  servicesEnabled = true,
}) => (
  <View style={[styles.wrap, { backgroundColor: subtleBg }]}>
    {TABS.map((tab) => {
      const isActive = activeTab === tab.key;
      const isServices = tab.key === 'services';
      const dimmed = isServices && !servicesEnabled;

      return (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            isActive && { backgroundColor: cardBg },
            dimmed && styles.tabDisabled,
          ]}
          onPress={() => {
            
            onTabChange(tab.key);
          }}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.tabLabel,
              {
                color: dimmed
                  ? textColor + '44'
                  : isActive
                    ? textColor
                    : textColor + '99',
              },
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
  tabDisabled: {
    opacity: 0.55,
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
