import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import { NotificationBellButton } from '../NotificationBellButton';
import { ServiceStatusButton } from '../ServiceStatusButton';
import { TabHeader } from '../TabHeader';

export interface ExploreHeaderProps {
  textColor: string;
  buttonBg: string;
  onSearchPress?: () => void;
  hideSearchIcon?: boolean;
  children?: React.ReactNode;
}

const ExploreHeaderComponent: React.FC<ExploreHeaderProps> = ({
  textColor,
  buttonBg,
  onSearchPress,
  hideSearchIcon = false,
  children,
}) => {
  const handleSearchPress = useCallback(() => {
    
    onSearchPress?.();
  }, [onSearchPress]);

  return (
    <View>
      <TabHeader
        title="Explore"
        rightActions={
          <View style={styles.actions}>
            {!hideSearchIcon && (
              <GuardedPressable
                style={[styles.iconButton, { backgroundColor: buttonBg }]}
                onPress={handleSearchPress}
                accessibilityRole="button"
                accessibilityLabel="Search"
              >
                <Ionicons name="search-outline" size={22} color={textColor} />
              </GuardedPressable>
            )}
            <ServiceStatusButton backgroundColor={buttonBg} iconColor={textColor} size={44} />
            <NotificationBellButton backgroundColor={buttonBg} iconColor={textColor} size={44} />
          </View>
        }
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const ExploreHeader = memo(ExploreHeaderComponent);
export default ExploreHeader;
