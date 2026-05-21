import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Spacing, Typography } from '../../constants';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  titleColor: string;
  actionColor: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel = 'See all',
  onActionPress,
  titleColor,
  actionColor,
}) => (
  <View style={styles.container}>
    <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
    {onActionPress ? (
      <TouchableOpacity onPress={onActionPress} hitSlop={8}>
        <Text style={[styles.action, { color: actionColor }]}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 4,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  action: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
});

export default SectionHeader;
