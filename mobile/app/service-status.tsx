import React, { useCallback } from 'react';
import { ServiceStatusView } from '../components/ServiceStatus';
import { useAppRouter } from '../hooks';

export default function ServiceStatusScreen() {
  const router = useAppRouter();

  const handleBack = useCallback(() => {
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router]);

  return <ServiceStatusView onBack={handleBack} />;
}
