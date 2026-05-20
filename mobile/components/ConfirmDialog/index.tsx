import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import { ConfirmDialogProps } from './types';

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon = 'help-circle-outline',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const isDestructive = variant === 'destructive';

  const handleCancel = () => {
    if (isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  const handleConfirm = () => {
    if (isLoading) return;
    Haptics.notificationAsync(
      isDestructive
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlayInner}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={FadeIn.duration(220)}
              style={[styles.card, { backgroundColor: cardBg }]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDestructive
                      ? Colors.error + '18'
                      : Colors.primary + '15',
                  },
                ]}
              >
                <Ionicons
                  name={isDestructive ? 'log-out-outline' : icon}
                  size={28}
                  color={isDestructive ? Colors.error : Colors.primary}
                />
              </View>

              <Text style={[styles.title, { color: Colors.text }]}>{title}</Text>
              <Text style={[styles.message, { color: Colors.icon }]}>{message}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: subtleBg, borderColor: Colors.border },
                  ]}
                  onPress={handleCancel}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelText, { color: Colors.text }]}>
                    {cancelLabel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    {
                      backgroundColor: isDestructive ? Colors.error : Colors.primary,
                      opacity: isLoading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleConfirm}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={isDark && !isDestructive ? '#09090B' : '#FFFFFF'}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.confirmText,
                        { color: isDark && !isDestructive ? '#09090B' : '#FFFFFF' },
                      ]}
                    >
                      {confirmLabel}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  overlayInner: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  cancelText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export default ConfirmDialog;
