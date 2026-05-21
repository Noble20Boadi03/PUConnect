import React, { useCallback, useMemo } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ChatView } from '../../components/Chat';
import { buildProviderProfileHref, getChatThread } from '../../lib';
import { useAppRouter } from '../../hooks';
import { Spacing, Typography } from '../../constants';

export default function ChatScreen() {
  const { username, postId } = useLocalSearchParams<{
    username: string;
    postId?: string;
  }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const resolvedPostId = typeof postId === 'string' ? postId : undefined;

  const thread = useMemo(() => {
    if (typeof username !== 'string') return undefined;
    return getChatThread(username, resolvedPostId);
  }, [username, resolvedPostId]);

  const exitToMessages = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/messages' as any);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        exitToMessages();
        return true;
      });
      return () => sub.remove();
    }, [exitToMessages])
  );

  const handleOpenPost = useCallback(
    (id: string) => {
      router.push(`/post/${id}?fromProvider=1&fromChat=1` as any);
    },
    [router]
  );

  const handleOpenPostForRequest = useCallback(
    (id: string) => {
      router.push(`/post/${id}?fromProvider=1&fromRequestService=1` as any);
    },
    [router]
  );

  const handleViewProviderProfile = useCallback(() => {
    if (typeof username !== 'string') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(buildProviderProfileHref(username) as any);
  }, [username, router]);

  if (!thread) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <Text style={[styles.notFoundTitle, { color: textColor }]}>Chat not found</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={exitToMessages}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>Back to Messages</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ChatView
      thread={thread}
      onBack={exitToMessages}
      onOpenPost={handleOpenPost}
      onOpenPostForRequest={handleOpenPostForRequest}
      onViewProviderProfile={handleViewProviderProfile}
    />
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notFoundTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notFoundBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
});
