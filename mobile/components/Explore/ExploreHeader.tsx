import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { GuardedPressable } from '../GuardedPressable';
import { NotificationBellButton } from '../NotificationBellButton';
import { ServiceStatusButton } from '../ServiceStatusButton';

export interface ExploreHeaderProps {
  textColor: string;
  buttonBg: string;
  onSearchPress?: () => void;
  hideSearchIcon?: boolean;
}

const ExploreHeaderComponent: React.FC<ExploreHeaderProps> = ({
  textColor,
  buttonBg,
  onSearchPress,
  hideSearchIcon = false,
}) => {
  const handleSearchPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSearchPress?.();
  }, [onSearchPress]);

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: textColor }]}>Explore</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
