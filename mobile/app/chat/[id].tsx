import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system/legacy';
import ImageView from 'react-native-image-viewing';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useAppAlert } from '@/context/alert-context';
import { api } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { User, Listing, ConversationLifecycle } from '@/types';

type Message = {
  id: string;
  text?: string;
  senderId: string;
  timestamp: string;
  type: 'text' | 'image' | 'document';
  attachmentUri?: string;
  fileName?: string;
};

export default function ChatScreen() {
  const { id, listingId } = useLocalSearchParams<{ id: string; listingId?: string }>();
  const { theme, isDark } = useTheme();
  const { user, token } = useAuth();
  const { showAlert } = useAppAlert();
  const { showActionSheetWithOptions } = useActionSheet();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState('');
  const [peer, setPeer] = useState<User | null>(null);
  const [lifecycle, setLifecycle] = useState<ConversationLifecycle>('open');
  const [loadingPeer, setLoadingPeer] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextListing, setContextListing] = useState<Listing | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Dynamic behavior to prevent "sticky" keyboard layout after dismissal
  const initialBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const [keyboardBehavior, setKeyboardBehavior] = useState<"height" | "padding" | "position" | undefined>(initialBehavior);

  // ── Navigation Intercept ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'REPLACE' || e.data.action.type === 'NAVIGATE') return;
      e.preventDefault();
      router.replace('/(tabs)/messages');
    });
    return unsubscribe;
  }, [navigation, router]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardBehavior(initialBehavior)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardBehavior(undefined)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [initialBehavior]);

  // ── Data Fetching ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!listingId) return;
      try {
        const listing = await api.getListing(listingId as string);
        if (!cancelled) setContextListing(listing);
      } catch (e) {
        console.error('Failed to fetch listing context:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [listingId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id || !token) return;
      try {
        const data = await api.getConversation(token, id as string, listingId as string | undefined);
        if (!cancelled) {
          const mapped: Message[] = data.map(m => ({
            id: m.id,
            text: m.message,
            senderId: m.senderId,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
          }));
          if (mapped.length > 0) {
            // Grouping logic (simplified for UI)
            const firstDate = new Date(data[0].createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
            setMessages([
              { id: 'time-sep', text: '', senderId: 'time-separator', timestamp: firstDate, type: 'text' },
              ...mapped
            ]);
          } else {
            setMessages([]);
          }
        }
      } catch (e) {
        console.error('Failed to fetch messages:', e);
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
    return () => { cancelled = true; };
  }, [id]);

  const refreshLifecycle = useCallback(async () => {
    if (!user?.id || !id || !token) return;
    const s = await api.getConversationLifecycle(user.id, id as string, listingId as string | undefined, token);
    setLifecycle(s);
  }, [user?.id, id, listingId, token]);

  useEffect(() => { refreshLifecycle(); }, [refreshLifecycle]);

  // ── Scroll Behaviors ──────────────────────────────────────────────
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    // Whenever messages change (like when adding a new one), wait a tick and scroll down
    setTimeout(scrollToBottom, 50);
  }, [messages.length]);

  // ── Attachment Handling ───────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newMessage: Message = {
        id: `msg-img-${Date.now()}`,
        senderId: user?.id ?? 'mock-user-001',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image',
        attachmentUri: asset.uri,
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMessage: Message = {
          id: `msg-doc-${Date.now()}`,
          senderId: user?.id ?? 'mock-user-001',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'document',
          attachmentUri: asset.uri,
          fileName: asset.name,
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (e) {
      console.error('Document picker error:', e);
    }
  };

  const openAttachmentMenu = () => {
    const options = ['Send Image', 'Send Document', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Attachments',
        containerStyle: { paddingBottom: insets.bottom },
      },
      (selectedIndex) => {
        if (selectedIndex === 0) pickImage();
        else if (selectedIndex === 1) pickDocument();
      }
    );
  };

  const getMimeType = (fileName?: string) => {
    if (!fileName) return '*/*';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };
    return map[ext!] || '*/*';
  };

  /**
   * TODO: Improve file opening capabilities. Current implementation (IntentLauncher/Sharing) 
   * has platform-specific limitations and may require a more robust PDF/Document viewer 
   * integration or a centralized file bridge in future iterations.
   */
  const handleOpenDocument = async (uri: string, fileName?: string) => {
    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(uri);
        const mimeType = getMimeType(fileName);
        
        try {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // Grant read permission
            type: mimeType,
          });
        } catch (intentError) {
          // Fallback if no specific app can handle this file type
          console.warn('No native activity found, falling back to share sheet');
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(uri);
          } else {
            throw intentError;
          }
        }
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          showAlert({ title: 'Sharing Unavailable', subtitle: 'This device does not support file sharing.', severity: 'error' });
        }
      }
    } catch (e) {
      console.error('Opening error:', e);
      showAlert({ title: 'Error', subtitle: 'No app found to open this file type. Please install a compatible viewer.', severity: 'error' });
    }
  };

  // ── Actions ───────────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: `msg-sent-${Date.now()}`,
      text: inputText,
      senderId: user?.id ?? 'mock-user-001', // Fallback to current mock user if state hasn't updated
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const requestService = async () => {
    if (!user?.id || !id || !token) return;
    try {
      await api.setConversationLifecycle(user.id, id as string, listingId as string | undefined, 'hired', token);
      setLifecycle('hired');
      showAlert({ title: 'Service Requested', subtitle: `You've contracted this service with ${peerLabel}.`, severity: 'success' });
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
        showAlert({ title: 'Completed', subtitle: 'This collaboration is marked complete.', severity: 'success' });
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

  const handleMute = () => {
    showAlert({ title: 'Mute', subtitle: 'Notifications muted for this chat.', severity: 'info' });
  };

  // ── Native Action Sheet ───────────────────────────────────────────
  const openMenu = () => {
    const options: string[] = [];
    const actionMap: (() => void)[] = [];

    if (lifecycle === 'open') {
      options.push('Request Service');
      actionMap.push(requestService);
    }
    if (lifecycle === 'hired') {
      options.push('Mark Complete');
      actionMap.push(markComplete);
    }

    options.push('Mute');
    actionMap.push(handleMute);
    
    // Add Cancel for dismissal support
    options.push('Cancel');
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: lifecycle === 'hired' ? 'Service Active' : lifecycle === 'completed' ? 'Completed' : 'Actions',
        containerStyle: {
          paddingBottom: insets.bottom,
        },
      },
      (selectedIndex) => {
        if (selectedIndex !== undefined && selectedIndex !== cancelButtonIndex) {
          actionMap[selectedIndex]?.();
        }
      }
    );
  };

  // ── Derived ───────────────────────────────────────────────────────
  const peerLabel = peer?.fullName ?? 'Campus member';
  
  const isServiceActive = lifecycle === 'hired';
  const isCompleted = lifecycle === 'completed';

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.surface }]}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={0} // No layout wrapper, so we handle raw OS padding directly
    >
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      {/* ── Modern Header Area ──────────────────────────────── */}
      <View style={[
        styles.topContainer, 
        { 
            paddingTop: insets.top,
            backgroundColor: isServiceActive 
                ? theme.primaryContainer
                : theme.surface 
        }
      ]}>
          <View style={[styles.headerRow, horizontalPadding]}>
            {/* Back */}
            <Pressable hitSlop={10} onPress={() => router.replace('/(tabs)/messages')} style={styles.backBtn}>
                <ThemedIcon name="chevron-left" size={30} colorName={isServiceActive ? 'primary' : 'text'} />
            </Pressable>

            {/* Peer Info */}
            <View style={styles.headerCenter}>
                {loadingPeer ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                    <>
                        {peer?.profilePictureUrl ? (
                            <Image source={{ uri: peer.profilePictureUrl }} style={styles.headerAvatar} />
                        ) : (
                            <View style={[styles.headerAvatarPlaceholder, { backgroundColor: theme.primary + '15' }]}>
                                <ThemedText align="center" style={{ fontWeight: 'bold' }} colorName="primary">
                                    {peerLabel.charAt(0)}
                                </ThemedText>
                            </View>
                        )}
                        <View style={styles.headerTextWrap}>
                            <ThemedText variant="titleMedium" style={{ fontWeight: '700' }} numberOfLines={1}>
                                {peerLabel}
                            </ThemedText>
                            <ThemedText variant="labelSmall" style={{ marginTop: 2, color: isServiceActive ? theme.primary : theme.textMuted }}>
                                {isServiceActive 
                                    ? '● Active Collaboration' 
                                    : isCompleted 
                                        ? '✓ Completed' 
                                        : (peer?.department ? `${peer.department} · '26` : 'Campus Member')}
                            </ThemedText>
                        </View>
                    </>
                )}
            </View>

            {/* Actions */}
            <Pressable hitSlop={10} onPress={openMenu} style={styles.menuBtn}>
                <ThemedIcon name="dots-vertical" size={26} colorName="textSecondary" />
            </Pressable>
          </View>

          {/* ── Sleek Context Banner ────────────────────────────── */}
          {contextListing && (
            <Pressable
                onPress={() => router.push({ pathname: '/listing/[id]', params: { id: contextListing.id, fromChat: 'true' } })}
                style={({ pressed }) => [
                    styles.contextBanner,
                    { borderTopColor: isServiceActive ? (isDark ? '#064e3b' : '#d1fae5') : theme.outlineVariant },
                    pressed && { opacity: 0.7 }
                ]}
            >
                <ThemedIcon name="bookmark-outline" size={14} colorName="textMuted" />
                <ThemedText variant="labelSmall" colorName="textMuted" style={{ marginHorizontal: 6 }}>
                    Discussing:
                </ThemedText>
                <ThemedText variant="labelSmall" numberOfLines={1} style={{ fontWeight: '600', flex: 1 }}>
                    {contextListing.title}
                </ThemedText>
                <View style={[styles.contextTinyBadge, { backgroundColor: contextListing.type === 'service_offer' ? theme.primaryContainer : theme.tertiaryContainer }]}>
                    <ThemedText style={{ fontSize: 9, fontWeight: 'bold' }} colorName={contextListing.type === 'service_offer' ? 'primary' : 'tertiary'}>
                        {contextListing.type === 'service_offer' ? 'OFFER' : 'NEED'}
                    </ThemedText>
                </View>
                <ThemedIcon name="chevron-right" size={14} colorName="textMuted" style={{ marginLeft: Spacing.xs }} />
            </Pressable>
          )}
      </View>

      {/* ── Chat Canvas ─────────────────────────────────────── */}
      <ScrollView
        ref={scrollViewRef}
        style={[styles.chatCanvas, { backgroundColor: theme.background }]} 
        contentContainerStyle={[styles.scrollContent, horizontalPadding]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((item, index) => {
          if (item.senderId === 'time-separator') {
            return (
              <View key={item.id} style={styles.timeWrap}>
                  <ThemedText variant="labelSmall" colorName="textSecondary" style={styles.timeLabel}>
                    {item.timestamp.toUpperCase()}
                  </ThemedText>
              </View>
            );
          }

          const isMe = item.senderId === user?.id || item.senderId === 'mock-user-001';
          
          // Determine if bubble needs a "tail" (only the last message in a consecutive group)
          const nextMessage = messages[index + 1];
          const hasTail = !nextMessage || nextMessage.senderId !== item.senderId;

          return (
            <View 
                key={item.id} 
                style={[
                    styles.messageWrapper, 
                    isMe ? styles.wrapperMe : styles.wrapperThem,
                    { marginBottom: hasTail ? Spacing.md : 4 } // tighter grouping
                ]}
            >
              <View
                style={[
                  styles.bubbleBase,
                  isMe ? [styles.bubbleMe, { backgroundColor: theme.primary }] : [styles.bubbleThem, { backgroundColor: theme.surfaceVariant }],
                  item.type === 'image' && styles.imageBubble,
                  hasTail && (isMe ? styles.bubbleMeTail : styles.bubbleThemTail),
                  !isMe && !isDark && styles.shadow 
                ]}
              >
                {item.type === 'text' && (
                  <ThemedText
                    variant="bodyLarge"
                    colorName={isMe ? 'onPrimary' : 'text'}
                    style={styles.messageText}
                  >
                    {item.text}
                  </ThemedText>
                )}

                {item.type === 'image' && item.attachmentUri && (
                    <Pressable onPress={() => setFullScreenImage(item.attachmentUri!)}>
                        <Image 
                            source={{ uri: item.attachmentUri }} 
                            style={styles.attachmentImage}
                            resizeMode="cover"
                        />
                    </Pressable>
                )}

                {item.type === 'document' && (
                    <Pressable onPress={() => item.attachmentUri && handleOpenDocument(item.attachmentUri, item.fileName)} style={styles.documentCard}>
                        <View style={[styles.docIconWrap, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : theme.primary + '15' }]}>
                            <ThemedIcon name="file-document-outline" size={24} colorName={isMe ? 'onPrimary' : 'primary'} />
                        </View>
                        <View style={styles.docInfo}>
                            <ThemedText variant="labelLarge" colorName={isMe ? 'onPrimary' : 'text'} numberOfLines={1}>
                                {item.fileName || 'Document'}
                            </ThemedText>
                            <ThemedText variant="labelSmall" colorName={isMe ? 'onPrimary' : 'textMuted'} style={{ opacity: 0.8 }}>
                                Tap to open
                            </ThemedText>
                        </View>
                    </Pressable>
                )}

                <ThemedText 
                  variant="labelSmall" 
                  style={[styles.messageMetaTime, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}
                >
                  {item.timestamp}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Modern Input Pill ───────────────────────────────── */}
      <View style={[styles.inputSector, { paddingBottom: Math.max(insets.bottom, Spacing.sm), backgroundColor: theme.surface }, horizontalPadding]}>
        <Pressable hitSlop={15} style={styles.plusBtn} onPress={openAttachmentMenu}>
            <ThemedIcon name="plus" size={24} colorName="primary" />
        </Pressable>
        
        <View style={[styles.inputPill, { backgroundColor: theme.surfaceVariant }]}>
            <TextInput
                style={[styles.pillInput, { color: theme.text }]}
                placeholder="Message..."
                placeholderTextColor={theme.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
            />
            {inputText.trim().length > 0 && (
                <Pressable onPress={handleSendMessage} style={[styles.sendBtn, { backgroundColor: theme.primary }]}>
                    <ThemedIcon name="arrow-up" size={16} lightColor="#fff" darkColor="#fff" style={{ marginTop: 1 }} />
                </Pressable>
            )}
        </View>
      </View>

      {/* ── Image Lightbox (ImageView supports zoom/pinch/swipe) ── */}
      <ImageView
        images={fullScreenImage ? [{ uri: fullScreenImage }] : []}
        imageIndex={0}
        visible={!!fullScreenImage}
        onRequestClose={() => setFullScreenImage(null)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        backgroundColor={isDark ? '#000' : 'rgba(0,0,0,0.9)'}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  
  // Header
  topContainer: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: Spacing.md,
      paddingTop: Spacing.xs,
  },
  backBtn: {
      marginRight: Spacing.sm,
      marginLeft: -4,
  },
  headerCenter: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
  },
  headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: Spacing.sm,
  },
  headerAvatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: Spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
  },
  headerTextWrap: {
      flex: 1,
  },
  menuBtn: {
      padding: Spacing.xs,
      marginRight: -4,
  },

  // Context Banner
  contextBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
  },
  contextTinyBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
  },

  // Canvas
  chatCanvas: {
      flex: 1,
  },
  scrollContent: {
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.xxl,
  },
  timeWrap: {
      alignItems: 'center',
      marginVertical: Spacing.xl,
  },
  timeLabel: {
      fontWeight: '600',
      letterSpacing: 0.5,
  },
  
  // Bubbles
  messageWrapper: {
      flexDirection: 'row',
      width: '100%',
  },
  wrapperMe: {
      justifyContent: 'flex-end',
      paddingLeft: '20%', // max width 80%
  },
  wrapperThem: {
      justifyContent: 'flex-start',
      paddingRight: '20%',
  },
  bubbleBase: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: '100%',
  },
  bubbleMe: {
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 6,
  },
  bubbleThem: {
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 18,
  },
  bubbleMeTail: {
      borderBottomRightRadius: 0,
  },
  bubbleThemTail: {
      borderBottomLeftRadius: 0,
  },
  imageBubble: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 220,
    height: 160,
    borderRadius: 16,
    marginBottom: 4,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    gap: Spacing.sm,
    minWidth: 180,
    maxWidth: 240,
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
  },
  messageText: {
      fontSize: 15,
      lineHeight: 22,
  },
  messageMetaTime: {
      fontSize: 10,
      alignSelf: 'flex-end',
      marginTop: 2,
      marginBottom: -2, // pull it slightly closer to the text base bounds
  },

  // Input
  inputSector: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingTop: Spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  plusBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.xs,
      marginBottom: 2,
  },
  inputPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      borderRadius: 24,
      paddingLeft: Spacing.lg,
      paddingRight: 6,
      paddingVertical: Platform.OS === 'ios' ? 8 : 4,
      minHeight: 44,
      marginBottom: 4,
  },
  pillInput: {
      flex: 1,
      maxHeight: 120,
      fontSize: 16,
      lineHeight: 20,
      paddingTop: Platform.OS === 'ios' ? 6 : 8,
      paddingBottom: Platform.OS === 'ios' ? 6 : 8,
  },
  sendBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Platform.OS === 'ios' ? 3 : 6,
      marginLeft: Spacing.sm,
  },
});
