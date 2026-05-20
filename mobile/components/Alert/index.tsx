import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  visible?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  visible = true,
}) => {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  // Curated premium alert color configurations
  const alertStyles = {
    error: {
      bg: isDark ? '#271C1C' : '#FEF2F2',
      border: '#EF4444',
      text: isDark ? '#FCA5A5' : '#B91C1C',
      icon: 'alert-circle' as const,
    },
    success: {
      bg: isDark ? '#14271B' : '#F0FDF4',
      border: Colors.primary || '#22C55E',
      text: isDark ? '#A7F3D0' : '#15803D',
      icon: 'checkmark-circle' as const,
    },
    info: {
      bg: isDark ? '#1C2538' : '#EFF6FF',
      border: '#3B82F6',
      text: isDark ? '#93C5FD' : '#1D4ED8',
      icon: 'information-circle' as const,
    },
    warning: {
      bg: isDark ? '#2D2214' : '#FFFBEB',
      border: '#F59E0B',
      text: isDark ? '#FDE047' : '#B45309',
      icon: 'warning' as const,
    },
  };

  const styleConfig = alertStyles[type];

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).springify().damping(18)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        },
      ]}
    >
      <Ionicons
        name={styleConfig.icon}
        size={20}
        color={styleConfig.border}
        style={styles.icon}
      />
      <View style={styles.contentContainer}>
        {title ? (
          <Text style={[styles.title, { color: styleConfig.text }]}>{title}</Text>
        ) : null}
        <Text style={[styles.message, { color: styleConfig.text + 'E6' }]}>
          {message}
        </Text>
      </View>
      {dismissible && (
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={16} color={styleConfig.text} />
        </TouchableOpacity>
      )}
    </Animated.View>
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
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: Typography.size.xs,
    lineHeight: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 2,
    marginTop: -2,
    marginRight: -4,
  },
});

export default Alert;
