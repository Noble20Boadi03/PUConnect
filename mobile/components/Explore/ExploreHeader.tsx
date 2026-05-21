import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Spacing, Typography } from '../../constants';
import { NotificationBellButton } from '../NotificationBellButton';

export interface ExploreHeaderProps {
  textColor: string;
  buttonBg: string;
}

const ExploreHeaderComponent: React.FC<ExploreHeaderProps> = ({ textColor, buttonBg }) => (
  <View style={styles.header}>
    <Text style={[styles.title, { color: textColor }]}>Explore</Text>
    <NotificationBellButton backgroundColor={buttonBg} iconColor={textColor} size={44} />
  </View>
);

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
});

export const ExploreHeader = memo(ExploreHeaderComponent);
export default ExploreHeader;
