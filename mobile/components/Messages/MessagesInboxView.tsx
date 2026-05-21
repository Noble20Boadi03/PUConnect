import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { ConversationListItem } from './ConversationListItem';
import { NotificationBellButton } from '../NotificationBellButton';
import type { ConversationPreview } from '../../types';

type InboxFilter = 'all' | 'unread';

export interface MessagesInboxViewProps {
  conversations: ConversationPreview[];
  onConversationPress: (conversation: ConversationPreview) => void;
}

export const MessagesInboxView: React.FC<MessagesInboxViewProps> = ({
  conversations,
  onConversationPress,
}) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const listBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const dividerColor = isDark ? '#27272A' : '#E8E8EC';
  const unreadTint = isDark ? Colors.primary + '12' : Colors.primary + '0D';
  const contextPillBg = isDark ? '#27272A' : '#F4F4F5';

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<InboxFilter>('all');

  const totalUnread = useMemo(
    () =>
      conversations.reduce((sum, c) => sum + (c.unread ? (c.unreadCount ?? 1) : 0), 0),
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === 'unread' && !c.unread) return false;
      if (!q) return true;
      const haystack = [
        c.participant.displayName,
        c.participant.handle,
        c.contextLine?.text,
        c.lastMessage,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, filter, query]);

  const pinned = useMemo(
    () => filteredConversations.filter((c) => c.isPinned),
    [filteredConversations]
  );
  const rest = useMemo(
    () => filteredConversations.filter((c) => !c.isPinned),
    [filteredConversations]
  );
  const sections = useMemo(() => {
    const result: { title: string; data: ConversationPreview[] }[] = [];
    if (pinned.length > 0) result.push({ title: 'Pinned', data: pinned });
    if (rest.length > 0) result.push({ title: 'Recent', data: rest });
    return result;
  }, [pinned, rest]);

  const setInboxFilter = useCallback((next: InboxFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(next);
  }, []);

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: ConversationPreview;
      index: number;
      section: { data: ConversationPreview[] };
    }) => (
      <ConversationListItem
        conversation={item}
        textColor={Colors.text}
        mutedColor={Colors.icon}
        primaryColor={Colors.primary}
        unreadTint={unreadTint}
        contextPillBg={contextPillBg}
        dividerColor={dividerColor}
        onlineBorderColor={listBg}
        isLast={index === section.data.length - 1}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onConversationPress(item);
        }}
      />
    ),
    [
      Colors.text,
      Colors.icon,
      Colors.primary,
      unreadTint,
      contextPillBg,
      dividerColor,
      listBg,
      onConversationPress,
    ]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) =>
      sections.length > 1 ? (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: Colors.icon }]}>
            {section.title.toUpperCase()}
          </Text>
        </View>
      ) : null,
    [sections.length, Colors.icon]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: Colors.text }]}>Messages</Text>
          {totalUnread > 0 ? (
            <View style={[styles.unreadSummary, { backgroundColor: Colors.primary + '22' }]}>
              <Text style={[styles.unreadSummaryText, { color: Colors.primary }]}>
                {totalUnread} unread
              </Text>
            </View>
          ) : (
            <Text style={[styles.subtitle, { color: Colors.icon }]}>
              {conversations.length} conversations
            </Text>
          )}
        </View>

        <NotificationBellButton backgroundColor={listBg} iconColor={Colors.text} size={44} />
      </View>

      <View style={styles.toolbar}>
        <View style={[styles.searchBar, { backgroundColor: listBg }]}>
          <Ionicons name="search-outline" size={20} color={Colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors.text }]}
            placeholder="Search messages"
            placeholderTextColor={Colors.icon}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => setQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={Colors.icon} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={[styles.filterRow, { backgroundColor: subtleBg }]}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && { backgroundColor: listBg }]}
            onPress={() => setInboxFilter('all')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: filter === 'all' ? Colors.text : Colors.icon },
                filter === 'all' && styles.filterLabelActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'unread' && { backgroundColor: listBg }]}
            onPress={() => setInboxFilter('unread')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: filter === 'unread' ? Colors.text : Colors.icon },
                filter === 'unread' && styles.filterLabelActive,
              ]}
            >
              Unread
            </Text>
            {totalUnread > 0 ? (
              <View style={[styles.filterBadge, { backgroundColor: Colors.primary }]}>
                <Text
                  style={[
                    styles.filterBadgeText,
                    { color: isDark ? '#09090B' : '#FFFFFF' },
                  ]}
                >
                  {totalUnread}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.listCard, { backgroundColor: listBg }]}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            sections.length === 0 ? styles.listEmptyContent : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: subtleBg }]}>
                <Ionicons name="chatbubbles-outline" size={32} color={Colors.icon} />
              </View>
              <Text style={[styles.emptyTitle, { color: Colors.text }]}>
                {query || filter === 'unread' ? 'No matches' : 'No messages yet'}
              </Text>
              <Text style={[styles.emptyBody, { color: Colors.icon }]}>
                {query
                  ? 'Try a different name, topic, or keyword.'
                  : filter === 'unread'
                    ? 'You are all caught up.'
                    : 'Start a conversation from a service or provider profile.'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  unreadSummary: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 20,
  },
  unreadSummaryText: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  toolbar: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '500',
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
  },
  filterLabel: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  filterLabelActive: {
    fontWeight: '800',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  listCard: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    paddingTop: Spacing.sm + 2,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  listEmptyContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MessagesInboxView;
