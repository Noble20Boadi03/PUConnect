import React, { useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GuardedPressable } from '../GuardedPressable';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useNotificationsStore } from '../../store/notificationsStore';
import { useAppRouter } from '../../hooks';

export interface NotificationBellButtonProps {
  backgroundColor: string;
  iconColor: string;
  badgeColor?: string;
  size?: number;
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({
  backgroundColor,
  iconColor,
  badgeColor = '#FF3B30',
  size = 40,
}) => {
  const router = useAppRouter();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notifications' as any);
  }, [router]);

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <GuardedPressable
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
      }
    >
      <Ionicons name="notifications-outline" size={22} color={iconColor} />
      {unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </GuardedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default NotificationBellButton;
