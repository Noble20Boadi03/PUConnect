import React, { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

import { NotificationsView } from '../components/Notifications';
import { useAppRouter } from '../hooks';

export default function NotificationsScreen() {
  const router = useAppRouter();

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router]);

  return <NotificationsView onBack={handleBack} />;
}
