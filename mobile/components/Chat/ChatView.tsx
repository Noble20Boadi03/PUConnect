import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { getProviderServices } from '../../lib';
import { ChatHeader } from './ChatHeader';
import { ChatContextBanner } from './ChatContextBanner';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatComposer } from './ChatComposer';
import { ChatOptionsSheet, type ChatMenuAction } from './ChatOptionsSheet';
import { ChatAttachmentSheet, type ChatAttachmentAction } from './ChatAttachmentSheet';
import { ChatOfficialHireSheet } from './ChatOfficialHireSheet';
import { ProviderServicesSheet } from './ProviderServicesSheet';
import type { ChatDateGroup, ChatMessage, ChatThread, OfficialHireStatus } from '../../types';

function formatSentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function appendMessages(groups: ChatDateGroup[], messages: ChatMessage[]): ChatDateGroup[] {
  if (messages.length === 0) return groups;

  const next = groups.map((g) => ({ ...g, messages: [...g.messages] }));
  const lastGroup = next[next.length - 1];

  if (lastGroup) {
    lastGroup.messages.push(...messages);
    return next;
  }

  return [{ dateLabel: 'TODAY', messages: [...messages] }];
}

function appendSentMessage(groups: ChatDateGroup[], text: string): ChatDateGroup[] {
  const trimmed = text.trim();
  if (!trimmed) return groups;

  const next = groups.map((g) => ({ ...g, messages: [...g.messages] }));
  const lastGroup = next[next.length - 1];
  const newMessage = {
    id: `local-${Date.now()}`,
    kind: 'sent' as const,
    text: trimmed,
    time: formatSentTime(),
  };

  if (lastGroup) {
    lastGroup.messages.push(newMessage);
    return next;
  }

  return [
    {
      dateLabel: 'TODAY',
      messages: [newMessage],
    },
  ];
}

export interface ChatViewProps {
  thread: ChatThread;
  onBack: () => void;
  onOpenPost?: (postId: string) => void;
  /** Post detail from request-service picker (no profile, request CTA). */
  onOpenPostForRequest?: (postId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  thread,
  onBack,
  onOpenPost,
  onOpenPostForRequest,
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const sentBg = Colors.primary;
  const sentText = isDark ? '#09090B' : '#FFFFFF';

  const [draft, setDraft] = useState('');
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [servicesVisible, setServicesVisible] = useState(false);
  const [hireSheetVisible, setHireSheetVisible] = useState(false);
  const [officialHireStatus, setOfficialHireStatus] = useState<OfficialHireStatus>('none');
  const scrollRef = useRef<ScrollView>(null);
  const [dateGroups, setDateGroups] = useState<ChatDateGroup[]>(() =>
    thread.dateGroups.map((g) => ({ ...g, messages: [...g.messages] }))
  );

  const providerServices = useMemo(
    () => getProviderServices(thread.providerUsername),
    [thread.providerUsername]
  );

  const handleOpenPost = useCallback(() => {
    if (!thread.postContext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenPost?.(thread.postContext.postId);
  }, [thread.postContext, onOpenPost]);

  const handleMoreOptions = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOptionsVisible(true);
  }, []);

  const canOfficialHire =
    thread.postContext?.tag === 'Service' && officialHireStatus === 'none';

  const handleMenuSelect = useCallback(
    (action: ChatMenuAction) => {
      if (action === 'browseServices') {
        setServicesVisible(true);
      } else if (action === 'hireService' && thread.postContext) {
        setHireSheetVisible(true);
      }
    },
    [thread.postContext]
  );

  const handleConfirmOfficialHire = useCallback(() => {
    if (!thread.postContext) return;
    setOfficialHireStatus('active');
    const time = formatSentTime();
    setDateGroups((prev) =>
      appendMessages(prev, [
        {
          id: `system-hire-${Date.now()}`,
          kind: 'system',
          text: `Official service request started for “${thread.postContext!.title}”.`,
          time,
        },
        {
          id: `recv-hire-${Date.now()}`,
          kind: 'received',
          text: `Thanks! I have received your official request for “${thread.postContext!.title}”. I will confirm details shortly.`,
          time,
        },
      ])
    );
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [thread.postContext]);

  const handleAttachSelect = useCallback((action: ChatAttachmentAction) => {
    if (action === 'photos' || action === 'documents') {
      // Pure UI — picker not wired yet.
    }
  }, []);

  const handleAttach = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachVisible(true);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDateGroups((prev) => appendSentMessage(prev, trimmed));
    setDraft('');
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [draft]);

  const displayGroups = useMemo(() => dateGroups, [dateGroups]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <ChatHeader
        participant={thread.participant}
        subtleBg={subtleBg}
        textColor={Colors.text}
        mutedColor={Colors.icon}
        onBack={onBack}
        onMoreOptions={handleMoreOptions}
      />

      {thread.postContext ? (
        <ChatContextBanner
          context={thread.postContext}
          cardBg={cardBg}
          subtleBg={subtleBg}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          primaryColor={Colors.primary}
          officialHireActive={officialHireStatus === 'active'}
          onPress={handleOpenPost}
        />
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {displayGroups.map((group) => (
            <View key={group.dateLabel}>
              <View style={styles.dateSeparator}>
                <View style={[styles.dateLine, { backgroundColor: subtleBg }]} />
                <Text style={[styles.dateLabel, { color: Colors.icon }]}>{group.dateLabel}</Text>
                <View style={[styles.dateLine, { backgroundColor: subtleBg }]} />
              </View>
              {group.messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  sentBg={sentBg}
                  sentText={sentText}
                  receivedBg={cardBg}
                  receivedText={Colors.text}
                  mutedColor={Colors.icon}
                  primaryColor={Colors.primary}
                  systemBg={subtleBg}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        <ChatComposer
          value={draft}
          onChangeText={setDraft}
          onAttach={handleAttach}
          onSend={handleSend}
          cardBg={cardBg}
          subtleBg={subtleBg}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          primaryColor={Colors.primary}
          bottomInset={insets.bottom}
        />
      </KeyboardAvoidingView>

      <ChatOptionsSheet
        visible={optionsVisible}
        showBrowseServices={!thread.postContext}
        showHireService={canOfficialHire}
        onSelect={handleMenuSelect}
        onClose={() => setOptionsVisible(false)}
      />

      {thread.postContext ? (
        <ChatOfficialHireSheet
          visible={hireSheetVisible}
          context={thread.postContext}
          providerName={thread.participant.displayName}
          onConfirm={handleConfirmOfficialHire}
          onClose={() => setHireSheetVisible(false)}
        />
      ) : null}

      <ChatAttachmentSheet
        visible={attachVisible}
        onSelect={handleAttachSelect}
        onClose={() => setAttachVisible(false)}
      />

      <ProviderServicesSheet
        visible={servicesVisible}
        providerName={thread.participant.displayName}
        services={providerServices}
        onSelectService={(postId) => onOpenPostForRequest?.(postId)}
        onClose={() => setServicesVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default ChatView;
