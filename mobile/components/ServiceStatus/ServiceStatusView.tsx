import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Spacing, Typography } from '../../constants';
import { useThemeColor, useAppRouter } from '../../hooks';
import { useAuthStore, useServiceRequestsStore } from '../../store';
import { serviceKindLabel, serviceStatusLabel } from '../../lib';
import type { DbServiceRequest } from '../../types/core';

const REQUEST_ACCENT = '#F59E0B';

export interface ServiceStatusViewProps {
  onBack: () => void;
}

export const ServiceStatusView: React.FC<ServiceStatusViewProps> = ({ onBack }) => {
  const Colors = useThemeColor();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const userId = useAuthStore((s) => s.user?.id);
  const requests = useServiceRequestsStore((s) => s.requests);
  const isLoading = useServiceRequestsStore((s) => s.isLoading);
  const fetchRequests = useServiceRequestsStore((s) => s.fetchRequests);

  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [requests]);

  const handleRefresh = useCallback(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleOpenDetails = useCallback(
    (request: DbServiceRequest) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/service-request/${request.id}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: DbServiceRequest }) => {
      if (!userId) return null;
      const isRequester = item.requesterId === userId;
      const peer = isRequester ? item.provider : item.requester;
      const roleLabel = isRequester
        ? item.kind === 'service'
          ? 'You requested'
          : 'You posted'
        : item.kind === 'service'
          ? 'Client request'
          : 'Your response';
      const accent = item.kind === 'response' ? REQUEST_ACCENT : Colors.primary;
      const status = serviceStatusLabel(item.status);

      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardBg }]}
          onPress={() => handleOpenDetails(item)}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.kindPill, { backgroundColor: accent + '18' }]}>
              <Text style={[styles.kindPillText, { color: accent }]}>
                {serviceKindLabel(item.kind)}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: subtleBg }]}>
              <Text style={[styles.statusText, { color: Colors.text }]}>{status}</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: Colors.text }]} numberOfLines={2}>
            {item.post?.title ?? 'Untitled listing'}
          </Text>
          <Text style={[styles.meta, { color: Colors.icon }]}>
            {roleLabel} · {peer?.name ?? 'Unknown'}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={[styles.updated, { color: Colors.icon }]}>
              Updated {new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.icon} />
          </View>
        </TouchableOpacity>
      );
    },
    [userId, cardBg, subtleBg, Colors, handleOpenDetails]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Service Status</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={[styles.subtitle, { color: Colors.icon }]}>
        Track official requests and responses you are involved in — as client or provider.
      </Text>

      {isLoading && sortedRequests.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sortedRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: cardBg }]}>
              <Ionicons name="document-text-outline" size={40} color={Colors.icon} />
              <Text style={[styles.emptyTitle, { color: Colors.text }]}>No official engagements yet</Text>
              <Text style={[styles.emptyBody, { color: Colors.icon }]}>
                Start one from a chat using Request Service or Submit Official Response in the menu.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  kindPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kindPillText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  meta: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  updated: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ServiceStatusView;
