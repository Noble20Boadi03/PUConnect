import React, { useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { GuardedPressable } from '../GuardedPressable';
import { useAppRouter } from '../../hooks';
import { useAuthStore, useServiceRequestsStore } from '../../store';
import { isActiveServiceStatus } from '../../lib/mapServiceRequest';

export interface ServiceStatusButtonProps {
  backgroundColor: string;
  iconColor: string;
  badgeColor?: string;
  size?: number;
}

export const ServiceStatusButton: React.FC<ServiceStatusButtonProps> = ({
  backgroundColor,
  iconColor,
  badgeColor = '#F59E0B',
  size = 40,
}) => {
  const router = useAppRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const requests = useServiceRequestsStore((s) => s.requests);
  const activeCount = requests.filter(
    (r) =>
      !!userId &&
      isActiveServiceStatus(r.status) &&
      (r.requesterId === userId || r.providerId === userId)
  ).length;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/service-status' as any);
  }, [router]);

  const badgeLabel = activeCount > 9 ? '9+' : String(activeCount);

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
        activeCount > 0
          ? `Active services, ${activeCount} in progress`
          : 'View service status'
      }
    >
      <Ionicons name="document-text-outline" size={22} color={iconColor} />
      {activeCount > 0 ? (
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

export default ServiceStatusButton;
