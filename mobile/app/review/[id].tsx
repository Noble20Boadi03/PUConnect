import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAppAlert } from '@/context/alert-context';
import { useResponsive } from '@/hooks/use-responsive';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewScreen() {
  const { id: listingId, targetUserId } = useLocalSearchParams<{ id: string; targetUserId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { token } = useAuth();
  const { showAlert } = useAppAlert();
  const { horizontalPadding } = useResponsive();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const peerId = typeof targetUserId === 'string' ? targetUserId : '';

  const submit = async () => {
    if (!token || !listingId || !peerId) {
      showAlert({ title: 'Missing data', subtitle: 'Cannot submit review.', severity: 'error' });
      return;
    }
    if (!comment.trim()) {
      showAlert({ title: 'Add a comment', subtitle: 'Tell others about your experience.', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await api.submitReview(
        { listingId: listingId as string, targetUserId: peerId, rating, comment: comment.trim() },
        token
      );
      showAlert({
        title: 'Thank you',
        subtitle: 'Your review was submitted.',
        severity: 'success',
        primaryButtonTitle: 'Done',
        onPrimaryPress: () => router.replace('/(tabs)/home')
      });
    } catch (e: any) {
      showAlert({ title: 'Error', subtitle: e?.message ?? 'Could not submit review.', severity: 'error' });
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
        <ScreenHeader title="Leave a review" backIcon="close" />

        <View style={[styles.body, horizontalPadding, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <ThemedView style={[styles.card, { borderColor: theme.outlineVariant }]}>
             <ThemedText variant="bodyLarge" colorName="textSecondary" align="center">
                Rate your experience for this completed engagement.
             </ThemedText>

             <View style={styles.stars}>
                {STARS.map((s) => (
                   <Pressable key={s} onPress={() => setRating(s)} style={styles.starBtn} accessibilityLabel={`Rate ${s} stars`}>
                      <ThemedIcon
                         name={s <= rating ? 'star' : 'star-outline'}
                         size={42}
                         lightColor="#fbbf24"
                         darkColor="#fbbf24"
                      />
                   </Pressable>
                ))}
             </View>

             <ThemedText variant="labelLarge" align="center" style={{ marginTop: Spacing.md, color: theme.primary }}>
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
             </ThemedText>
          </ThemedView>

          <View style={styles.commentSection}>
             <ThemedText variant="labelLarge" colorName="textSecondary" style={styles.label}>
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
          </View>

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

  body: { flex: 1, paddingTop: Spacing.md },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.level1,
  },
  commentSection: {
    marginTop: Spacing.xl,
  },
  label: { marginBottom: Spacing.sm, fontWeight: '700' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs, marginTop: Spacing.lg },
  starBtn: { padding: Spacing.xs },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 140,
    fontSize: 16,
  },
});
