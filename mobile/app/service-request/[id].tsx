import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ServiceRequestDetailsView } from '../../components/ServiceStatus/ServiceRequestDetailsView';
import { useAppRouter, useThemeColor } from '../../hooks';
import { useServiceRequestsStore } from '../../store/serviceRequestsStore';
import { serviceRequestService } from '../../services/serviceRequestService';
import type { DbServiceRequest } from '../../types/core';
import { useLocalSearchParams } from 'expo-router';

export default function ServiceRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useAppRouter();
  const Colors = useThemeColor();

  const { requests, fetchRequests, upsertRequest } = useServiceRequestsStore();
  const [loading, setLoading] = useState(true);
  const [serviceRequest, setServiceRequest] = useState<DbServiceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/service-status' as any);
    }
  }, [router]);

  const loadServiceRequest = useCallback(async () => {
    if (!id) return;

    // First check store
    const existing = requests.find((r) => r.id === id);
    if (existing) {
      setServiceRequest(existing);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    try {
      setLoading(true);
      const request = await serviceRequestService.getById(id);
      upsertRequest(request);
      setServiceRequest(request);
      setError(null);
    } catch (err) {
      console.error('Failed to load service request:', err);
      setError('Failed to load service request');
    } finally {
      setLoading(false);
    }
  }, [id, requests, upsertRequest]);

  useEffect(() => {
    // Initial fetch of requests if needed
    fetchRequests().then(() => {});
  }, [fetchRequests]);

  useEffect(() => {
    loadServiceRequest();
  }, [loadServiceRequest]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !serviceRequest) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: Colors.text, textAlign: 'center' }}>
          {error || 'Service request not found'}
        </Text>
      </View>
    );
  }

  return <ServiceRequestDetailsView serviceRequest={serviceRequest} onBack={handleBack} />;
}
