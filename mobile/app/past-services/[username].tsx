import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppRouter, useServiceRequests } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { profileService } from '../../services';
import type { DbServiceRequest } from '../../types/core';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getStatusBadgeColor(status: string, isDark: boolean) {
  switch (status) {
    case 'completed':
      return {
        text: 'Completed', color: isDark ? '#10b981' : '#059669' };
    case 'cancelled':
      return {
        text: 'Cancelled', color: isDark ? '#ef4444' : '#dc2626' };
    case 'declined':
      return {
        text: 'Declined', color: isDark ? '#ef4444' : '#dc2626' };
    default:
      return {
        text: status, color: isDark ? '#6b7280' : '#4b5563' };
  }
}

export default function PastServicesScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useAppRouter();
  const { getPastServicesWithUser, fetchRequests, hydrated, isLoading } = useServiceRequests();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F4';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const iconColor = isDark ? '#9ca3af' : '#6b7280';
  const primaryColor = isDark ? '#a78bfa' : '#6d28d9';

  const pastServices = useMemo(() => {
    if (!peerId || !hydrated) return [];
    return getPastServicesWithUser(peerId);
  }, [peerId, getPastServicesWithUser, hydrated]);

  useEffect(() => {
    const loadPeerAndRequests = async () => {
      if (username) {
        setLoading(true);
        try {
          const participantProfile = await profileService.getPublicProfile(username);
          setPeerId(participantProfile.id);
          await fetchRequests(true);
        } catch (e) {
          console.error('Failed to load past services:', e);
        } finally {
          setLoading(false);
        }
      }
    };
    loadPeerAndRequests();
  }, [username, fetchRequests]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/messages' as any);
    }
  }, [router]);

  const handleServicePress = useCallback((serviceRequestId: string) => {
    router.push(`/service-request/${serviceRequestId}?readOnly=true` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: DbServiceRequest }) => {
    const statusInfo = getStatusBadgeColor(item.status, isDark);
    const postTitle = item.post?.title ?? 'Service Request';
    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: cardBg }]}
        onPress={() => handleServicePress(item.id)}
      >
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={2}>{postTitle}</Text>
          <View style={styles.itemMeta}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
            <Text style={[styles.itemDate, { color: iconColor }]}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={iconColor} />
      </TouchableOpacity>
    );
  }, [cardBg, textColor, iconColor, isDark, handleServicePress]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Past Services</Text>
        <View style={{ width: 40 }} />
      </View>
      {(loading || isLoading) ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : pastServices.length > 0 ? (
        <FlatList
          data={pastServices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={48} color={iconColor} />
          <Text style={[styles.emptyText, { color: iconColor }]}>No past services</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 16,
  },
  itemContent: { flex: 1, marginRight: Spacing.md, gap: Spacing.sm },
  itemTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
    lineHeight: 24,
  },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statusBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  itemDate: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
});
