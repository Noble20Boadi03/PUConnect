import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ProviderProfileView } from '../../components/ProviderProfile';
import { getProviderProfileByUsername } from '../../lib';
import { Spacing, Typography } from '../../constants';

export default function ProviderProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
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
      router.replace('/(tabs)/market');
    }
  }, [router]);

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/post/${postId}?fromProvider=1` as any);
    },
    [router]
  );

  const handleSendMessage = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

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
