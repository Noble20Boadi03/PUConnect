import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';

export interface MarketTipBannerProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Static tip banner (no Reanimated) — avoids layout work during scroll.
 */
const MarketTipBannerComponent: React.FC<MarketTipBannerProps> = ({
  message,
  onDismiss,
}) => {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#1C2538' : '#EFF6FF';
  const border = '#3B82F6';
  const text = isDark ? '#93C5FD' : '#1D4ED8';

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name="information-circle" size={20} color={border} style={styles.icon} />
      <Text style={[styles.message, { color: text }]}>{message}</Text>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton} hitSlop={8}>
        <Ionicons name="close" size={16} color={text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  icon: {
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontSize: Typography.size.xs,
    lineHeight: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 2,
    marginTop: -2,
  },
});

export const MarketTipBanner = memo(MarketTipBannerComponent);

export default MarketTipBanner;
