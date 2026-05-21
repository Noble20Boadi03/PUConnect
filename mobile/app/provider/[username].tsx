import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ProviderProfileView } from '../../components/ProviderProfile';
import { buildChatHref, getProviderProfileByUsername } from '../../lib';
import { useAppRouter } from '../../hooks';
import { Spacing, Typography } from '../../constants';

export default function ProviderProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useAppRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const profile =
    typeof username === 'string' ? getProviderProfileByUsername(username) : undefined;

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/market' as any);
    }
  }, [router]);

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/post/${postId}?fromProvider=1` as any);
    },
    [router]
  );

  const handleSendMessage = useCallback(() => {
    if (!profile) return;
    router.push(buildChatHref(profile.handle) as any);
  }, [profile, router]);

  const handleOpenReviews = useCallback(() => {
    if (!profile) return;
    router.push(`/provider/${profile.username}/reviews` as any);
  }, [profile, router]);

  const handleLeaveReview = useCallback(() => {
    if (!profile) return;
    router.push(`/provider/${profile.username}/review` as any);
  }, [profile, router]);

  if (!profile) {
    return (
      <SafeAreaView
        style={[styles.notFound, { backgroundColor: screenBg }]}
        edges={['top', 'bottom']}
      >
        <Text style={[styles.notFoundTitle, { color: textColor }]}>Profile not found</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <Text style={[styles.notFoundBtnText, { color: textColor }]}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ProviderProfileView
      profile={profile}
      onBack={handleBack}
      onPostPress={handlePostPress}
      onSendMessage={handleSendMessage}
      onOpenReviews={handleOpenReviews}
      onLeaveReview={handleLeaveReview}
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
