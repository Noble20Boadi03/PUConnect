import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import { MarketTipBanner } from '../MarketTipBanner';
import { NotificationBellButton } from '../NotificationBellButton';
import { ServiceStatusButton } from '../ServiceStatusButton';
import { TabHeader } from '../TabHeader';
import type { MarketFilter } from '../../types';

const FILTERS: { key: MarketFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'services', label: 'Services' },
  { key: 'requests', label: 'Requests' },
];

export interface MarketHeaderTopProps {
  textColor: string;
  iconColor: string;
  primaryColor: string;
  borderColor: string;
  searchBg: string;
  cardBg: string;
  showTip: boolean;
  onDismissTip: () => void;
  activeFilter: MarketFilter;
  onFilterChange: (filter: MarketFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const MarketHeaderTopComponent: React.FC<MarketHeaderTopProps> = ({
  textColor,
  iconColor,
  primaryColor,
  borderColor,
  searchBg,
  cardBg,
  showTip,
  onDismissTip,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const isDark = useColorScheme() === 'dark';
  const border = '#3B82F6';

  const handleFilterPress = useCallback(
    (filter: MarketFilter) => {
      
      onFilterChange(filter);
    },
    [onFilterChange]
  );

  const handleToggleTip = useCallback(() => {
    
    if (showTip) {
      onDismissTip();
    } else {
      // If we need to show it, but currently the parent controls showTip,
      // so let's assume we have a way to toggle, but for now, let's just call onDismissTip as toggle
      onDismissTip();
    }
  }, [showTip, onDismissTip]);

  return (
    <View>
      <TabHeader
        title="Market"
        rightActions={
          <View style={styles.rightIcons}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <ServiceStatusButton backgroundColor={searchBg} iconColor={textColor} size={44} />
            <NotificationBellButton backgroundColor={searchBg} iconColor={textColor} size={44} />
          </View>
        }
      />
      <View style={styles.contentContainer}>
        <View style={[styles.searchContainer, { backgroundColor: searchBg }]}>
          <Ionicons name="search-outline" size={18} color={iconColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search Services or Requests"
            placeholderTextColor={iconColor + '90'}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
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
          <TouchableOpacity onPress={handleToggleTip} hitSlop={8} style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color={border} />
          </TouchableOpacity>
        </View>

        {showTip && (
          <MarketTipBanner
            message="Browse Services for professional help or Requests from students who need your skills."
            onDismiss={onDismissTip}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
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
    justifyContent: 'space-between',
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
  infoIcon: {
    padding: Spacing.xs,
  },
});

export const MarketHeaderTop = memo(MarketHeaderTopComponent);
// Keep original exports for backwards compatibility
const MarketHeaderLegacy = memo((props: React.ComponentProps<typeof MarketHeaderTop>) => (
  <>
    <MarketHeaderTop {...props} />
  </>
));
MarketHeaderLegacy.displayName = 'MarketHeader';
export const MarketHeader = MarketHeaderLegacy;
export default MarketHeader;
