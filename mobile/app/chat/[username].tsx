import React, { useCallback, useEffect } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ChatView } from '../../components/Chat';
import { buildProviderProfileHref } from '../../lib';
import { useAppRouter } from '../../hooks';
import { useChat } from '../../hooks/useChat';
import { Spacing, Typography } from '../../constants';
import { profileService } from '../../services/profileService';
import { postService } from '../../services/postService';
import { parsePostPrice } from '../../lib/mapDbPost';
import { ChatPostContext } from '../../types';

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

  const { activeThread, isLoading, fetchMessages, sendMessage, subscribeToMessages } = useChat();

  useEffect(() => {
    const loadChat = async () => {
      if (username) {
        try {
          const [participantProfile, post] = await Promise.all([
            profileService.getPublicProfile(username),
            resolvedPostId ? postService.getPostById(resolvedPostId) : Promise.resolve(undefined)
          ]);
          
          let postContext: ChatPostContext | undefined = undefined;
          if (post) {
            const price = parsePostPrice(post.price);
            let priceLabel = '';
            if (price.kind === 'fixed') {
              priceLabel = `$${price.amount}`;
            } else if (price.kind === 'range') {
              priceLabel = `$${price.min}-$${price.max}`;
            }
            
            postContext = {
              postId: post.id,
              title: post.title,
              tag: post.tag as 'Service' | 'Request',
              priceLabel
            };
          }
          
          fetchMessages(username, {
            displayName: participantProfile.name || username,
            handle: `@${participantProfile.username || username}`,
            avatarUrl: participantProfile.avatarUrl || '',
          }, postContext);
        } catch (error) {
          console.error('Failed to load chat:', error);
          // Fallback to placeholder
          fetchMessages(username, {
            displayName: username,
            handle: `@${username}`,
            avatarUrl: '',
          }, undefined);
        }
        
        subscribeToMessages();
      }
    };
    loadChat();
  }, [username, resolvedPostId, fetchMessages, subscribeToMessages]);

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

  const handleSendMessage = useCallback((text: string) => {
    if (username) {
      const currentPostId = activeThread?.postContext?.postId;
      sendMessage(username, text, currentPostId);
    }
  }, [username, sendMessage, activeThread]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={textColor} />
      </SafeAreaView>
    );
  }

  if (!activeThread) {
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
      thread={activeThread}
      onBack={exitToMessages}
      onOpenPost={handleOpenPost}
      onOpenPostForRequest={handleOpenPostForRequest}
      onViewProviderProfile={handleViewProviderProfile}
      onSendMessage={handleSendMessage}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
