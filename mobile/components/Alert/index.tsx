import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
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
      bg: isDark ? '#1E1E1E' : '#FFFFFF',
      accent: '#EF4444',
      text: isDark ? '#E5E5E5' : '#171717',
      icon: 'alert-circle' as const,
    },
    success: {
      bg: isDark ? '#1E1E1E' : '#FFFFFF',
      accent: Colors.primary || '#22C55E',
      text: isDark ? '#E5E5E5' : '#171717',
      icon: 'checkmark-circle' as const,
    },
    info: {
      bg: isDark ? '#1E1E1E' : '#FFFFFF',
      accent: '#3B82F6',
      text: isDark ? '#E5E5E5' : '#171717',
      icon: 'information-circle' as const,
    },
    warning: {
      bg: isDark ? '#1E1E1E' : '#FFFFFF',
      accent: '#F59E0B',
      text: isDark ? '#E5E5E5' : '#171717',
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
          entering={ZoomIn.duration(300).springify().damping(18)}
          exiting={ZoomOut.duration(200)}
          style={[
            styles.alertCard,
            {
              backgroundColor: styleConfig.bg,
              borderColor: isDark ? '#333333' : '#E5E5E5',
            },
          ]}
        >
          <Ionicons
            name={styleConfig.icon}
            size={48}
            color={styleConfig.accent}
            style={styles.icon}
          />
          <View style={styles.contentContainer}>
            {title ? (
              <Text style={[styles.title, { color: styleConfig.text }]}>
                {title}
              </Text>
            ) : null}
            <Text style={[styles.message, { color: isDark ? styleConfig.text + 'CC' : '#525252' }]}>
              {message}
            </Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={handleDismiss}
            style={[styles.button, { borderColor: styleConfig.accent }]}
          >
            <Text style={[styles.buttonText, { color: styleConfig.accent }]}>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    width: '80%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.size.md,
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#333333',
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  button: {
    width: '100%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Typography.size.lg,
    fontWeight: '600',
  },
});

export default Alert;
