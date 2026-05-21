import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { useNotificationsStore } from '../../store/notificationsStore';
import type { MarketIconName } from '../../types';
import type { AppNotification, NotificationKind } from '../../constants/notificationsMock';

const KIND_ICONS: Record<NotificationKind, MarketIconName> = {
  message: 'chatbubble-outline',
  service: 'briefcase-outline',
  request: 'hand-right-outline',
  system: 'information-circle-outline',
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

  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const handleMarkAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAllRead();
  }, [markAllRead]);

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: item.read ? cardBg : Colors.primary + (isDark ? '14' : '10') },
          !item.read && styles.rowUnread,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          markRead(item.id);
        }}
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
    [cardBg, Colors.primary, Colors.text, Colors.icon, isDark, markRead, subtleBg]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
  },
  rowUnread: {},
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
});

export default NotificationsView;
