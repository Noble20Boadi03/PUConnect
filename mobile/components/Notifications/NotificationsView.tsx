import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useThemeColor, usePullToRefreshOnHeader } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { useNotificationsStore } from '../../store/notificationsStore';
import type { MarketIconName } from '../../types';
import type { AppNotification, NotificationKind } from '../../constants/notificationsMock';
import { handleNotificationNavigation, getNotificationActionLabel } from '../../lib';

const KIND_ICONS: Record<NotificationKind, MarketIconName> = {
  message: 'chatbubble-outline',
  service: 'briefcase-outline',
  request: 'hand-right-outline',
  system: 'information-circle-outline',
  review: 'star-outline',
};

export interface NotificationsViewProps {
  onBack: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack }) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const overlayBg = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const isLoading = useNotificationsStore((s) => s.isLoading);
  const isRefreshing = useNotificationsStore((s) => s.isRefreshing);
  const error = useNotificationsStore((s) => s.error);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const onRefresh = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const { panHandlers } = usePullToRefreshOnHeader({ onRefresh, isRefreshing });

  const handleMarkAll = useCallback(() => {
    markAllRead();
  }, [markAllRead]);

  const handleNotificationPress = useCallback((item: AppNotification) => {
    if (!item.read) {
      markRead(item.id);
    }
    setSelectedNotification(item);
  }, [markRead]);

  const handleAction = useCallback(() => {
    if (selectedNotification) {
      handleNotificationNavigation(selectedNotification, router);
      setSelectedNotification(null);
    }
  }, [selectedNotification, router]);

  const closeModal = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: item.read ? cardBg : Colors.primary + (isDark ? '14' : '10') },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.88}
      >
        <View style={[styles.iconWrap, { backgroundColor: subtleBg }]}>
          <Ionicons name={KIND_ICONS[item.kind]} size={20} color={Colors.primary} />
        </View>
        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text
              style={[styles.rowTitle, { color: Colors.text }, !item.read && styles.textBold]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.rowTime, { color: Colors.icon }]}>{item.time}</Text>
          </View>
          <Text style={[styles.rowBody, { color: Colors.icon }]} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        {!item.read ? (
          <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />
        ) : null}
      </TouchableOpacity>
    ),
    [cardBg, Colors.primary, Colors.text, Colors.icon, isDark, handleNotificationPress, subtleBg]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="warning-outline" size={64} color={Colors.icon} />
          <Text style={[styles.emptyTitle, { color: Colors.text }]}>
            Couldn't load notifications
          </Text>
          <Text style={[styles.emptyBody, { color: Colors.icon }]}>
            Pull to refresh
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-outline" size={64} color={Colors.icon} />
        <Text style={[styles.emptyTitle, { color: Colors.text }]}>No notifications yet</Text>
      </View>
    );
  }, [isLoading, error, Colors.text, Colors.icon]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View {...panHandlers} style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: subtleBg }]}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll} hitSlop={8}>
            <Text style={[styles.markAll, { color: Colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Spacing.xxl + insets.bottom },
          items.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />

      {/* Notification Detail Modal */}
      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
          <View style={[styles.modalContent, { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, Spacing.xxl) }]}>
            <View style={styles.modalHeader}>
              <View style={{ width: 32 }} />
              <View style={styles.modalHandle} />
              <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={Colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedNotification && (
                <>
                  <View style={[styles.modalIconWrap, { backgroundColor: subtleBg }]}>
                    <Ionicons
                      name={KIND_ICONS[selectedNotification.kind]}
                      size={32}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={[styles.modalTitle, { color: Colors.text }]}>
                    {selectedNotification.title}
                  </Text>
                  <Text style={[styles.modalTime, { color: Colors.icon }]}>
                    {selectedNotification.time}
                  </Text>
                  <Text style={[styles.modalBodyText, { color: Colors.text }]}>
                    {selectedNotification.body}
                  </Text>
                </>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                onPress={handleAction}
              >
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                  {selectedNotification ? getNotificationActionLabel(selectedNotification) : 'Dismiss'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    flex: 1,
    fontSize: Typography.size.xl,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  markAll: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 72,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  emptyBody: {
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowTitle: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  textBold: {
    fontWeight: '800',
  },
  rowTime: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  rowBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    lineHeight: 19,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  modalHandle: {
    flex: 1,
    height: 4,
    width: 40,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 2,
  },
  modalClose: {
    width: 32,
    alignItems: 'flex-end',
  },
  modalBody: {
    paddingHorizontal: Spacing.lg,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalTime: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalBodyText: {
    fontSize: Typography.size.md,
    lineHeight: 24,
  },
  modalFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});

export default NotificationsView;
