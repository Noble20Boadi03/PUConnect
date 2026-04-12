import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewScreen() {
  const { id: listingId, targetUserId } = useLocalSearchParams<{ id: string; targetUserId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { token } = useAuth();
  const { contentPaddingLeft, contentPaddingRight } = useResponsive();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const peerId = typeof targetUserId === 'string' ? targetUserId : '';

  const submit = async () => {
    if (!token || !listingId || !peerId) {
      Alert.alert('Missing data', 'Cannot submit review.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Add a comment', 'Tell others about your experience.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitReview(
        { listingId: listingId as string, targetUserId: peerId, rating, comment: comment.trim() },
        token
      );
      Alert.alert('Thank you', 'Your review was submitted.', [
        { text: 'Done', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!peerId) {
    return (
      <ScreenLayout>
        <View style={[styles.centered, horizontalPadding]}>
          <ThemedText variant="bodyLarge">Invalid review link.</ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText variant="labelLarge" colorName="primary" style={{ marginTop: Spacing.lg }}>
              Go back
            </ThemedText>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout padding="none" withSafeArea={false} scrollable={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, ...horizontalPadding }]}>
          <Pressable onPress={() => router.back()}>
            <ThemedIcon name="close" size={28} />
          </Pressable>
          <ThemedText variant="headlineSmall" style={styles.headerTitle}>
            Leave a review
          </ThemedText>
          <View style={{ width: 28 }} />
        </View>

        <View style={[styles.body, horizontalPadding, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <ThemedText variant="bodyLarge" colorName="textSecondary">
            Rate your experience for this completed engagement.
          </ThemedText>

          <View style={styles.stars}>
            {STARS.map((s) => (
              <Pressable key={s} onPress={() => setRating(s)} style={styles.starBtn}>
                <ThemedIcon
                  name={s <= rating ? 'star' : 'star-outline'}
                  size={36}
                  lightColor="#fbbf24"
                  darkColor="#fbbf24"
                />
              </Pressable>
            ))}
          </View>

          <ThemedText variant="labelLarge" colorName="textSecondary" style={{ marginTop: Spacing.lg }}>
            Comment
          </ThemedText>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="What went well? Would you hire them again?"
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              { color: theme.text, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceVariant },
            ]}
          />

          <PrimaryButton
            title="Submit review"
            onPress={submit}
            isLoading={submitting}
            disabled={submitting}
            size="large"
            marginTop={Spacing.xl}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  headerTitle: { fontWeight: '800' },
  body: { flex: 1, paddingTop: Spacing.md },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl },
  starBtn: { padding: Spacing.xs },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 120,
    marginTop: Spacing.sm,
    fontSize: 16,
  },
});
