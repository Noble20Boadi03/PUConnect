import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

export interface TabHeaderProps {
  title: string;
  rightActions?: React.ReactNode;
  backgroundColor?: string;
}

const TabHeaderComponent: React.FC<TabHeaderProps> = ({
  title,
  rightActions,
  backgroundColor = 'transparent',
}) => {
  const Colors = useThemeColor();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>{title}</Text>
        {rightActions && <View style={styles.rightActions}>{rightActions}</View>}
      </View>
    </SafeAreaView>
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});

export const TabHeader = memo(TabHeaderComponent);
export default TabHeader;
