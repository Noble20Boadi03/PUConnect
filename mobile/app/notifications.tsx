import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { NotificationsView } from '../components/Notifications';
import { useAppRouter, useNotifications } from '../hooks';

export default function NotificationsScreen() {
  const router = useAppRouter();
  const fetchNotifications = useNotifications((s) => s.fetchNotifications);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleBack = useCallback(() => {
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router]);

  return <NotificationsView onBack={handleBack} />;
}
