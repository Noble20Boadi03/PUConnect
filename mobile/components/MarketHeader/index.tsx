import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { MarketTipBanner } from '../MarketTipBanner';
import type { MarketFilter } from '../../types';

const FILTERS: { key: MarketFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'services', label: 'Services' },
  { key: 'requests', label: 'Requests' },
];

export interface MarketHeaderProps {
  textColor: string;
  iconColor: string;
  primaryColor: string;
  borderColor: string;
  cardBg: string;
  searchBg: string;
  showTip: boolean;
  onDismissTip: () => void;
  activeFilter: MarketFilter;
  onFilterChange: (filter: MarketFilter) => void;
}

const MarketHeaderComponent: React.FC<MarketHeaderProps> = ({
  textColor,
  iconColor,
  primaryColor,
  borderColor,
  cardBg,
  searchBg,
  showTip,
  onDismissTip,
  activeFilter,
  onFilterChange,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleFilterPress = useCallback(
    (filter: MarketFilter) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFilterChange(filter);
    },
    [onFilterChange]
  );

  const handleNotificationPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={[styles.headerContainer, { backgroundColor: cardBg }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.appTitle, { color: textColor }]}>PuConnect</Text>
        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: searchBg }]}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: searchBg }]}>
        <Ionicons name="search-outline" size={18} color={iconColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search Services or Requests"
          placeholderTextColor={iconColor + '90'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterPills}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? primaryColor : 'transparent',
                    borderColor: isActive ? primaryColor : borderColor,
                  },
                ]}
                onPress={() => handleFilterPress(filter.key)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isActive
                        ? isDark
                          ? '#09090B'
                          : '#FFFFFF'
                        : textColor,
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

      {showTip && (
        <MarketTipBanner
          message="Browse Services for professional help or Requests from students who need your skills."
          onDismiss={onDismissTip}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    elevation: 2,
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
});

export const MarketHeader = memo(MarketHeaderComponent);

export default MarketHeader;
