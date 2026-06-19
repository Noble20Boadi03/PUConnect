import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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
  autoDismiss?: boolean;
  autoDismissDuration?: number;
  buttonText?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = true,
  onDismiss,
  visible = true,
  autoDismiss = false,
  autoDismissDuration = 4000,
  buttonText = "OK",
}) => {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';

  // Auto-dismiss logic
  useEffect(() => {
    if (visible && autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismissDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDismiss, autoDismissDuration, onDismiss]);

  // Curated premium alert color configurations
  const alertStyles = {
    error: {
      accent: '#EF4444',
      icon: 'alert-circle' as const,
    },
    success: {
      accent: Colors.primary || '#22C55E',
      icon: 'checkmark-circle' as const,
    },
    info: {
      accent: '#3B82F6',
      icon: 'information-circle' as const,
    },
    warning: {
      accent: '#F59E0B',
      icon: 'warning' as const,
    },
  };

  const styleConfig = alertStyles[type];
  const isErrorOrWarning = type === 'error' || type === 'warning';

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View
        style={styles.overlay}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.alertCard,
            {
              backgroundColor: cardBg,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: styleConfig.accent + '18',
              },
            ]}
          >
            <Ionicons
              name={styleConfig.icon}
              size={28}
              color={styleConfig.accent}
            />
          </View>
          {title ? (
            <Text style={[styles.title, { color: Colors.text }]}>
              {title}
            </Text>
          ) : null}
          <Text style={[styles.message, { color: Colors.icon }]}>
            {message}
          </Text>
          <TouchableOpacity
            onPress={handleDismiss}
            style={[
              styles.button,
              {
                backgroundColor: styleConfig.accent,
              },
            ]}
          >
            <Text style={[
              styles.buttonText,
              {
                color: isErrorOrWarning ? '#FFFFFF' : Colors.onPrimary,
              },
            ]}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  alertCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  button: {
    width: '100%',
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export default Alert;
