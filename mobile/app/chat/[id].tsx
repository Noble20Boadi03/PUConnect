import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useAppAlert } from '@/context/alert-context';
import { api } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { User, ConversationLifecycle } from '@/types';

type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  type: 'text' | 'card';
  cardData?: {
    company: string;
    industry: string;
    title: string;
    salary: string;
    type: string;
    location: string;
    date: string;
  };
};

export default function ChatScreen() {
  const { id, listingId } = useLocalSearchParams<{ id: string; listingId?: string }>();
  const { theme, isDark } = useTheme();
  const { user, token } = useAuth();
  const { showAlert } = useAppAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const [inputText, setInputText] = useState('');
  const [peer, setPeer] = useState<User | null>(null);
  const [lifecycle, setLifecycle] = useState<ConversationLifecycle>('open');
  const [loadingPeer, setLoadingPeer] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id || !token) return;
      try {
        const data = await api.getConversation(token, id as string, listingId as string | undefined);
        if (!cancelled) {
          const mappedMessages: Message[] = data.map(m => ({
            id: m.id,
            text: m.message,
            senderId: m.senderId,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
          }));
          
          // Add a time separator if there are messages
          if (mappedMessages.length > 0) {
            setMessages([
              { id: 'time-sep', text: '', senderId: 'time-separator', timestamp: 'Today', type: 'text' },
              ...mappedMessages
            ]);
          } else {
            setMessages([]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch messages:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [id, token, listingId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      try {
        const u = await api.getUserById(id as string);
        if (!cancelled) setPeer(u);
      } finally {
        if (!cancelled) setLoadingPeer(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const refreshLifecycle = useCallback(async () => {
    if (!user?.id || !id || !token) return;
    const s = await api.getConversationLifecycle(user.id, id as string, listingId as string | undefined, token);
    setLifecycle(s);
  }, [user?.id, id, listingId, token]);

  useEffect(() => {
    refreshLifecycle();
  }, [refreshLifecycle]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      senderId: user?.id || 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const peerLabel = peer?.fullName ?? 'Campus member';
  const peerSubtitle = peer
    ? `${peer.department ?? 'Student'} · Class of ${peer.graduationYear ?? '—'}`
    : 'PuConnect';

  const markHired = async () => {
    if (!user?.id || !id || !token) return;
    try {
      await api.setConversationLifecycle(user.id, id as string, listingId as string | undefined, 'hired', token);
      setLifecycle('hired');
    } catch (e: any) {
      showAlert({ title: 'Error', subtitle: e?.message ?? 'Could not update status.', severity: 'error' });
    }
  };

  const markComplete = async () => {
    if (!user?.id || !id || !token) return;
    try {
      await api.setConversationLifecycle(user.id, id as string, listingId as string | undefined, 'completed', token);
      setLifecycle('completed');
      if (!listingId) {
        showAlert({ title: 'Completed', subtitle: 'This thread is marked complete.', severity: 'success' });
        return;
      }
      router.push({
        pathname: '/review/[id]',
        params: { id: listingId as string, targetUserId: id as string },
      });
    } catch (e: any) {
      showAlert({ title: 'Error', subtitle: e?.message ?? 'Could not complete.', severity: 'error' });
    }
  };

  return (
    <ScreenLayout scrollable={false} keyboardAvoiding padding="none" withSafeArea={false}>
      <ScreenHeader
        title={
          <View style={styles.headerInfo}>
             {loadingPeer ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <View style={styles.headerInfoInner}>
                {peer?.profilePictureUrl ? (
                  <Image source={{ uri: peer.profilePictureUrl }} style={styles.headerAvatar} />
                ) : (
                  <View style={[styles.headerAvatarPlaceholder, { backgroundColor: theme.surfaceVariant }]}>
                    <ThemedIcon name="account" size={16} colorName="primary" />
                  </View>
                )}
                <View>
                  <ThemedText variant="titleMedium" style={styles.headerName}>
                    {peerLabel}
                  </ThemedText>
                  <ThemedText variant="labelSmall" colorName="textMuted" numberOfLines={1}>
                    {peerSubtitle}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        }
        right={
          <Pressable onPress={() => showAlert({ title: 'Mute', subtitle: 'Mute controls will arrive in a later build.', severity: 'info' })}>
            <ThemedText variant="labelLarge" style={styles.muteBtn}>
              Mute
            </ThemedText>
          </Pressable>
        }
      />

      {user && id && token && listingId ? (
        <ThemedView style={[styles.lifecycleBar, { backgroundColor: theme.surfaceVariant, borderBottomColor: theme.outlineVariant }]}>
          <ThemedText variant="labelSmall" colorName="textSecondary" style={{ marginBottom: Spacing.xs }}>
            SERVICE STATUS
          </ThemedText>
          <View style={styles.lifecycleRow}>
             <View style={styles.lifecycleStatus}>
                <View style={[styles.statusIndicator, { backgroundColor: lifecycle === 'completed' ? '#22c55e' : lifecycle === 'hired' ? theme.primary : theme.outline }]} />
                <ThemedText variant="titleSmall" style={{ fontWeight: '700' }}>
                  {lifecycle === 'open' ? 'In Negotiation' : lifecycle === 'hired' ? 'Work in Progress' : 'Service Completed'}
                </ThemedText>
             </View>

            <View style={styles.lifecycleActions}>
              {lifecycle === 'open' && (
                <Pressable
                  onPress={markHired}
                  style={[styles.lifecycleBtn, { backgroundColor: theme.primary }]}
                >
                  <ThemedText variant="labelLarge" lightColor="#fff" darkColor="#fff">
                    Hired
                  </ThemedText>
                </Pressable>
              )}
              {lifecycle === 'hired' && (
                <Pressable
                  onPress={markComplete}
                  style={[styles.lifecycleBtn, { backgroundColor: theme.primary }]}
                >
                  <ThemedText variant="labelLarge" lightColor="#fff" darkColor="#fff">
                    Complete Work
                  </ThemedText>
                </Pressable>
              )}
              {lifecycle === 'completed' && (
                <View style={[styles.lifecycleBtn, { backgroundColor: theme.surfaceVariant, borderWidth: 1, borderColor: theme.outlineVariant }]}>
                   <ThemedText variant="labelLarge" colorName="textMuted">Finished</ThemedText>
                </View>
              )}
            </View>
          </View>
        </ThemedView>
      ) : null}

      <ScrollView
        style={styles.chatList}
        contentContainerStyle={[styles.scrollContent, horizontalPadding]}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((item) => {
          if (item.senderId === 'time-separator') {
            return (
              <ThemedText key={item.id} variant="labelSmall" colorName="textMuted" style={styles.timeSeparator}>
                {item.timestamp}
              </ThemedText>
            );
          }

          const isMe = item.senderId === user?.id || item.senderId === 'me';

          if (item.type === 'card' && item.cardData) {
            return (
              <View key={item.id} style={styles.cardWrapper}>
                <View
                  style={[
                    styles.jobCard,
                    {
                      backgroundColor: theme.surface,
                      borderLeftColor: theme.primary,
                      borderColor: theme.outlineVariant,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.companyLogo, { backgroundColor: '#f97316' }]}>
                      <ThemedIcon name="apps" size={20} lightColor="#fff" darkColor="#fff" />
                    </View>
                    <View>
                      <ThemedText variant="titleSmall" style={styles.companyName}>
                        {item.cardData.company}
                      </ThemedText>
                      <ThemedText variant="labelSmall" colorName="textMuted">
                        {item.cardData.industry}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="titleMedium" style={styles.jobTitle}>
                    {item.cardData.title}
                  </ThemedText>
                  <ThemedText variant="bodySmall" colorName="textSecondary" style={styles.jobMeta}>
                    {item.cardData.salary} • {item.cardData.type}
                  </ThemedText>
                  <ThemedText variant="labelSmall" colorName="textMuted" style={styles.jobLocation}>
                    {item.cardData.location} • {item.cardData.date}
                  </ThemedText>
                </View>
              </View>
            );
          }

          return (
            <View key={item.id} style={[styles.messageWrapper, isMe ? styles.myMessage : styles.theirMessage]}>
              {!isMe && (
                <View style={styles.avatar}>
                  <Image
                    source={{
                      uri: peer?.profilePictureUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
                    }}
                    style={styles.avatarImg}
                  />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isMe
                    ? { backgroundColor: isDark ? theme.primaryContainer : theme.primaryContainer }
                    : { backgroundColor: theme.surfaceVariant },
                ]}
              >
                <ThemedText
                  variant="bodyLarge"
                  colorName={isMe ? 'onPrimaryContainer' : 'onSurfaceVariant'}
                  style={styles.messageText}
                >
                  {item.text}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { borderTopColor: theme.outlineVariant, paddingBottom: insets.bottom + 12, ...horizontalPadding },
        ]}
      >
        <Pressable
          style={styles.attachBtn}
          onPress={() => showAlert({ title: 'Attachments', subtitle: 'File sharing will be available later.', severity: 'info' })}
        >
          <ThemedIcon name="plus" size={24} colorName="textMuted" />
        </Pressable>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surfaceVariant,
              borderColor: theme.outlineVariant,
              borderWidth: 1,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, { opacity: inputText.trim() ? 1 : 0.5 }]}
          onPress={handleSendMessage}
        >
          <ThemedIcon name="send" size={20} colorName="primary" />
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerInfoInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: Spacing.sm,
  },
  headerAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
  },
  muteBtn: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  lifecycleBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    ...Platform.select({
        ios: { ...Shadows.level1 },
        android: { elevation: 2 }
    })
  },
  lifecycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lifecycleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lifecycleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lifecycleBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 80,
    alignItems: 'center',
  },
  chatList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 20,
  },
  timeSeparator: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 24,
    fontWeight: '500',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardWrapper: {
    alignSelf: 'flex-start',
    width: '85%',
    marginBottom: 16,
    paddingLeft: 44,
  },
  jobCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    ...Shadows.level1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  jobMeta: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  attachBtn: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
