import React, { useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { PostDetailView } from '../../components/PostDetail';
import { buildChatHref, getPostDetailById, normalizeUsernameSlug } from '../../lib';
import { Spacing, Typography } from '../../constants';

export default function PostDetailScreen() {
  const { id, fromProvider, fromChat } = useLocalSearchParams<{
    id: string;
    fromProvider?: string;
    fromChat?: string;
  }>();
  const hideAuthorProfile =
    fromProvider === '1' ||
    fromProvider === 'true' ||
    fromChat === '1' ||
    fromChat === 'true';
  const returnToChat = fromChat === '1' || fromChat === 'true';
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const post = typeof id === 'string' ? getPostDetailById(id) : undefined;

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/market');
    }
  }, [router]);

  const handleSendMessage = useCallback(() => {
    if (!post) return;
    router.push(buildChatHref(post.author.username, post.id) as any);
  }, [post, router]);

  const handleReturnToChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else if (post) {
      router.replace(buildChatHref(post.author.username, post.id) as any);
    }
  }, [post, router]);

  const handleViewProvider = useCallback(
    (username: string) => {
      router.push(`/provider/${normalizeUsernameSlug(username)}` as any);
    },
    [router]
  );

  if (!post) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Text style={[styles.notFoundTitle, { color: textColor }]}>Post not found</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>Back to Market</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: screenBg }]}>
      <PostDetailView
        post={post}
        onBack={handleBack}
        onSendMessage={handleSendMessage}
        onViewProvider={hideAuthorProfile ? undefined : handleViewProvider}
        hideAuthorProfile={hideAuthorProfile}
        returnToChat={returnToChat}
        onReturnToChat={handleReturnToChat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
